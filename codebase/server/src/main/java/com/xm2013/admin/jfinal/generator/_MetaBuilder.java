package com.xm2013.admin.jfinal.generator;

import java.sql.SQLException;
import java.util.List;

import javax.sql.DataSource;

import com.jfinal.plugin.activerecord.generator.ColumnMeta;
import com.jfinal.plugin.activerecord.generator.MetaBuilder;
import com.jfinal.plugin.activerecord.generator.TableMeta;

public class _MetaBuilder extends MetaBuilder{

	@Override
	protected void buildColumnMetas(TableMeta tableMeta) throws SQLException {
		super.buildColumnMetas(tableMeta);
		
		if(tableMeta.columnMetas.size()>0) {
			List<ColumnMeta> columnMetas = tableMeta.columnMetas;
			for(ColumnMeta col : columnMetas) {
				if(col.remarks!=null) {
					col.remarks = col.remarks.replaceAll("\\s+", " ");
				}
			}
		}
	}

	public _MetaBuilder(DataSource dataSource) {
		super(dataSource);
	}
	
	

}
