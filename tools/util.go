package tools

import (
	"reflect"
	"unsafe"
)

// unsafe string to []byte
func Str2sbyte(s string) (b []byte) {
	hdr := *(*reflect.StringHeader)(unsafe.Pointer(&s))
	return *(*[]byte)(unsafe.Pointer(&reflect.SliceHeader{
		Data: hdr.Data,
		Len:  hdr.Len,
		Cap:  hdr.Len,
	}))
}

// unsafe []byte to string
func Sbyte2str(b []byte) string {
	return *(*string)(unsafe.Pointer(&b))
}
