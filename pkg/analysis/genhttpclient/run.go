package genhttpclient

import (
	"fmt"
	"github.com/fatih/structtag"
	"go/types"
	"golang.org/x/tools/go/analysis"
	"io/ioutil"
	"strconv"
	"strings"
)

type Endpoint struct {
	Name    string
	ReqType string
	ResType string
}
type TypeRegistry struct {
	names     map[string]int
	types     map[*types.Named]*TypeDef
	endpoints map[string]map[string][]Endpoint
}

func NewTypeRegistry() *TypeRegistry {
	return &TypeRegistry{names: make(map[string]int), types: make(map[*types.Named]*TypeDef), endpoints: make(map[string]map[string][]Endpoint)}
}

func (r *TypeRegistry) AddEndpoint(mod, ser, me, reqt, rest string) {
	services, ok := r.endpoints[mod]
	if !ok {
		r.endpoints[mod] = make(map[string][]Endpoint)
		services = r.endpoints[mod]
	}

	if _, ok := services[ser]; !ok {
		services[ser] = make([]Endpoint, 0)
	}
	services[ser] = append(services[ser], Endpoint{
		Name:    me,
		ReqType: reqt,
		ResType: rest,
	})

}

type TypeDef struct {
	Name   string
	Fields []TypeDefField
}

func (d *TypeDef) String() (s string) {
	s = d.Name
	s += "{ "
	for _, field := range d.Fields {
		s += field.String()
	}
	s += "}"
	return
}

func (r *TypeRegistry) Add(named *types.Named) *TypeDef {
	if td, ok := r.types[named]; ok {
		return td
	}

	name := named.Obj().Name()
	if v, ok := r.names[name]; ok {
		name += strconv.Itoa(v)
		r.names[name]++
	} else {
		r.names[name] = 0
	}

	td := &TypeDef{Name: name}
	r.types[named] = td
	st := named.Underlying().(*types.Struct)
	td.Fields = r.FieldsFromStruct(st)
	return td
}
func (r *TypeRegistry) FieldsFromStruct(st *types.Struct) (fields []TypeDefField) {
	for i := 0; i < st.NumFields(); i++ {
		field := st.Field(i)
		fields = append(fields, r.TypeDefFieldFromVar(field, st.Tag(i))...)
	}
	return
}

type TypeDefField struct {
	Name     string
	Required bool
	Nullable bool
	Type     string
}

func (f *TypeDefField) String() (tn string) {
	tn = f.Name
	if !f.Required {
		tn += "?"
	}
	tn += ": "
	if f.Nullable {
		tn += "null | "
	}
	tn += f.Type
	tn += ";"
	return
}

func (r *TypeRegistry) TypeDefFieldFromVar(va *types.Var, tagstr string) (fields []TypeDefField) {
	if !va.IsField() || !va.Exported() {
		return
	}
	if va.Embedded() {
		ty := va.Type()
		if t, ok := ty.(*types.Pointer); ok {
			ty = t.Elem()
		}
		named, ok := va.Type().(*types.Named)
		if !ok {
			return
		}

		td := r.Add(named)
		fields = append(fields, td.Fields...)
		return
	}
	field := TypeDefField{Name: va.Name(), Required: true}
	tags, err := structtag.Parse(tagstr)
	if err != nil {
		panic(err)
	}

	jsonTag, _ := tags.Get("json")
	if jsonTag != nil {
		if jsonTag.Name == "-" {
			return
		}
		field.Name = jsonTag.Name
		for _, opt := range jsonTag.Options {
			if opt == "omitempty" {
				field.Required = false
			}
		}
	}
	ty := va.Type()
	if t, ok := ty.(*types.Pointer); ok {
		ty = t.Elem()
	}
	if named, ok := ty.(*types.Named); ok {
		typePath := named.Obj().Type().String()
		if strings.HasPrefix(typePath, "gopkg.in/guregu/null") ||
			strings.HasSuffix(typePath, "base.ID") {
			field.Nullable = true
		}
	}

	field.Type = r.TsTypeString(va.Type())
	fields = append(fields, field)

	return
}

func (r *TypeRegistry) TsTypeString(ty types.Type) string {

	switch t := ty.(type) {
	case *types.Pointer:
		return r.TsTypeString(t.Elem())
	case *types.Basic:
		switch t.Kind() {
		case types.Int, types.Int8, types.Int16, types.Int32, types.Int64, types.Float32, types.Float64,
			types.Uint, types.Uint16, types.Uint8, types.Uint32, types.Uint64:
			return "number"
		case types.String:
			return "string"
		case types.Bool:
			return "boolean"
		}
	case *types.Slice:
		return r.TsTypeString(t.Elem()) + "[]"
	case *types.Map:
		return fmt.Sprintf("Record<%s,%s>", r.TsTypeString(t.Key()), r.TsTypeString(t.Key()))
	case *types.Array:
		return r.TsTypeString(t.Elem()) + "[]"
	case *types.Named:
		switch t.Obj().Type().String() {
		case "gopkg.in/guregu/null.v4.String":
			return "string"
		case "time.Time", "gorm.io/gorm.DeletedAt":
			return "Date"
		case "github.com/heymind/puki/pkg/base.ID":
			return "string"
		case "gopkg.in/guregu/null.v4.Int":
			return "number"
		case "gopkg.in/guregu/null.v4.Bool":
			return "boolean"
		case "gopkg.in/guregu/null.v4.Time":
			return "Date"
		}
		if _, ok := t.Underlying().(*types.Struct); ok {
			td := r.Add(t)
			return td.Name
		}
		return r.TsTypeString(t.Underlying())
	case *types.Struct:
		return (&TypeDef{Fields: r.FieldsFromStruct(t)}).String()
	default:
		fmt.Printf("unresolved type %+v", t)
	}
	return ""
}
func run(pass *analysis.Pass) (interface{}, error) {
	r := NewTypeRegistry()
	for _, pkg := range pass.Pkg.Imports() {
		if err := runPkg(r, pkg); err != nil {
			return nil, err
		}
	}
	var b strings.Builder
	b.WriteString("/* eslint-disable */\n")
	b.WriteString("export interface Endpoint<P, R> extends String {}")
	for _, td := range r.types {
		b.WriteString("export interface ")
		b.WriteString(td.String())
		b.WriteRune('\n')
	}
	for modName := range r.endpoints {
		b.WriteString("export const ")
		b.WriteString(modName)
		b.WriteString(" = {")
		for serviceName := range r.endpoints[modName] {
			b.WriteString(serviceName)
			b.WriteString(":{")
			for _, endpoint := range r.endpoints[modName][serviceName] {
				b.WriteString(fmt.Sprintf("%s: \"%s/%s.%s\" as Endpoint<%s,%s>,", endpoint.Name, modName, serviceName, endpoint.Name, endpoint.ReqType, endpoint.ResType))
			}
			b.WriteString("},")
		}
		b.WriteString("};")
	}
	ioutil.WriteFile(output, []byte(b.String()), 0644)
	return nil, nil
}
func runPkg(r *TypeRegistry, pkg *types.Package) error {
	segs := strings.Split(pkg.Path(), "/")
	modName := segs[len(segs)-2]
	var services []*types.Named
	scope := pkg.Scope()
	for _, name := range scope.Names() {
		object, ok := (scope.Lookup(name)).(*types.TypeName)
		if !ok || !strings.HasSuffix(name, "Service") {
			continue
		}
		service, ok := object.Type().(*types.Named)
		if !ok {
			continue
		}
		services = append(services, service)
	}

	for _, service := range services {
		for i := 0; i < service.NumMethods(); i++ {
			method := service.Method(i)
			sig := method.Type().(*types.Signature)
			if sig.Recv() == nil || sig.Params().Len() != 3 || sig.Results().Len() != 1 {
				continue
			}
			if sig.Params().At(0).Name() != "ctx" || sig.Params().At(1).Name() != "req" || sig.Params().At(2).Name() != "res" {
				continue
			}

			if sig.Results().At(0).Type().String() != "error" {
				continue
			}

			reqt := r.TsTypeString(sig.Params().At(1).Type())
			rest := r.TsTypeString(sig.Params().At(2).Type())
			r.AddEndpoint(modName, service.Obj().Name(), method.Name(), reqt, rest)

		}
	}
	return nil
}
