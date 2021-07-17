// +build vips

package file

import (
	"crypto/md5"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/davidbyttow/govips/v2/vips"
	"github.com/heymind/puki/pkg/base/rpc"
	"github.com/heymind/puki/tools"
)

var filePath string

func Init(path string) {
	vips.Startup(nil)
	filePath = path
}

func Upload(w http.ResponseWriter, r *http.Request) {
	var err error
	defer func() {
		if err != nil {
			body, _ := rpc.NewDataResBody(err.Error())
			body.WriteResponse(http.StatusBadRequest, w)
			return
		}
	}()

	r.ParseMultipartForm(32 << 20)
	file, handler, err := r.FormFile("file")
	if err != nil {
		return
	}
	defer file.Close()

	// Read first 512 bytes to get mimetype
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil {
		return
	}
	// check whether it is an image file
	contentType := http.DetectContentType(buffer)
	if len(contentType) < 5 || contentType[:5] != "image" {
		err = errors.New("not an image file")
		return
	}

	// compress image
	if n >= 512 {
		ri, _ := ioutil.ReadAll(file)
		buffer = append(buffer, ri...)
	} else {
		buffer = buffer[:n]
	}
	img, err := vips.NewImageFromBuffer(buffer)
	if err != nil {
		return
	}
	ep := vips.NewJpegExportParams()
	imgBytes, _, _ := img.ExportJpeg(ep)

	// save img to server
	timestamp := time.Now().UnixNano()
	md5FileName := fmt.Sprintf("%x%x.jpg", strconv.FormatInt(timestamp, 10), md5.Sum(tools.Str2sbyte(handler.Filename)))
	// assume filePath exists
	f, err := os.OpenFile(filePath+md5FileName, os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		return
	}
	defer f.Close()
	f.Write(imgBytes)

	body, _ := rpc.NewDataResBody(map[string]string{
		"fileName": md5FileName,
	})
	body.WriteResponse(http.StatusOK, w)
	return
}
