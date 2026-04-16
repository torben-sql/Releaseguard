package com.releaseguard.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        // url = "jdbc:sqlite:/path/to/releaseguard.db" — ensure parent dir exists
        String filePath = url.substring("jdbc:sqlite:".length());
        Path dbPath = Paths.get(filePath);
        try {
            Files.createDirectories(dbPath.getParent());
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to create database directory: " + dbPath.getParent(), e);
        }

        HikariDataSource ds = properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
        // SQLite does not support Connection.isValid(); use a query instead
        ds.setConnectionTestQuery("SELECT 1");
        return ds;
    }
}
