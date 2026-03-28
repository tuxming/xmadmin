package handlers

import (
	"context"
	"os"
	"regexp"

	"github.com/jmoiron/sqlx"
)

var idsRe = regexp.MustCompile(`^[0-9,]+$`)

func inStrings(field string, vals []string) (string, []any) {
	if len(vals) == 0 {
		return "1=0", nil
	}
	query, args, _ := sqlx.In(field+" IN (?)", vals)
	return query, args
}

func selectMapList(ctx context.Context, db *sqlx.DB, query string, args ...any) ([]map[string]any, error) {
	rows, err := db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []map[string]any
	for rows.Next() {
		row := make(map[string]any)
		if err := rows.MapScan(row); err == nil {
			// Ensure byte arrays from database are converted to string to avoid base64 JSON encoding
			for k, v := range row {
				if v == nil {
					continue
				}
				if b, ok := v.([]byte); ok {
					row[k] = string(b)
				}
			}
			list = append(list, row)
		}
	}
	if list == nil {
		list = []map[string]any{}
	}
	return list, nil
}

func getEnvParam(env, name string, defaultValue string) string {
	if v := os.Getenv(name); v != "" {
		return v
	}
	return defaultValue
}

func inInts(field string, ids []int) (string, []any) {
	if len(ids) == 0 {
		return "1=0", nil
	}
	query, args, _ := sqlx.In(field+" IN (?)", ids)
	return query, args
}
