package com.example;

import com.mysql.cj.jdbc.MysqlDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    private String user = System.getenv("DB_USER");
    private String password = System.getenv("DB_PWD");
    private String serverName = System.getenv("DB_SERVER"); // db host name, like localhost without the port
    private String dbName = System.getenv("DB_NAME");

    @Bean
    public DataSource dataSource() {
        MysqlDataSource datasource = new MysqlDataSource();
        datasource.setPassword(password);
        datasource.setUser(user);
        datasource.setServerName(serverName);
        datasource.setDatabaseName(dbName);
        datasource.setPort(3306); // default config
        datasource.setURL("jdbc:mysql://" + serverName + ":3306/" + dbName);
        return datasource;
    }
}
