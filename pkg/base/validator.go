package base

import (
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	zh_translations "github.com/go-playground/validator/v10/translations/zh"
	"reflect"
	"strings"
)

var _trans ut.Translator
var Validator = validator.New()

type transError struct {
	validator.FieldError
	StructType reflect.Type
}

// ValidateStruct validate a struct with a translated message.
func ValidateStruct(s interface{}) (bool, string) {
	err := Validator.Struct(s)
	if err == nil {
		return true, ""
	}
	errs := err.(validator.ValidationErrors)
	ty := reflect.TypeOf(s).Elem()
	var msgs []string
	for _, err := range errs {
		msgs = append(msgs, transError{FieldError: err, StructType: ty}.Translate(_trans))
	}
	return false, strings.Join(msgs, "\n")
}

func (f transError) Field() string {
	s, found := f.StructType.FieldByName(f.FieldError.StructField())
	if !found {
		return ""
	}
	trans := s.Tag.Get("trans")
	if len(trans) == 0 {
		trans = f.FieldError.Field()
	}
	return trans
}
func (f transError) Translate(ut ut.Translator) string {
	return strings.Replace(f.FieldError.Translate(ut), f.FieldError.Field(), f.Field(), 1)
}

func init() {
	zh := zh.New()
	uni := ut.New(zh, zh)
	trans, _ := uni.GetTranslator("zh")
	_trans = trans
	zh_translations.RegisterDefaultTranslations(Validator, trans)
}
