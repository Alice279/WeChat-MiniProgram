package base

import "gorm.io/gorm"

// Pagination can be embedded into service request/response body and can also act as a `gorm` scope.
type Pagination struct {
	PageNum    int `json:"pageNum,omitempty"`
	PageSize   int `json:"pageSize,omitempty"`
	PageCursor int `json:"pageCursor,omitempty"`
	TotalNum   int `json:"totalNum,omitempty"`
}

func (p *Pagination) AsScope() func(db *gorm.DB) *gorm.DB {
	pageNum := p.PageNum
	if pageNum <= 0 {
		pageNum = 1
	}
	pageSize := p.PageSize
	if pageSize < 0 {
		pageSize = 0
	}
	offset := (pageNum - 1) * pageSize
	return func(db *gorm.DB) *gorm.DB {
		if offset > 0 {
			db = db.Offset(offset)
		}
		if pageSize > 0 {
			db = db.Limit(pageSize)
		}
		return db
	}
}
func (p *Pagination) AsCursoredScope(clause string) func(db *gorm.DB) *gorm.DB {
	cursor := p.PageCursor
	limit := p.PageSize
	return func(db *gorm.DB) *gorm.DB {
		return db.Where(clause, cursor).Limit(limit)
	}
}
