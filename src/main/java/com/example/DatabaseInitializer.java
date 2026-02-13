package com.example;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@Component
public class DatabaseInitializer {

    private final DataSource dataSource;
    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    public DatabaseInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void init() {
        log.info("Initializing database...");
        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()) {
            createTable(stmt);
            generateData(stmt);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void createTable(Statement stmt) throws SQLException {
        String sqlStatement = """
                CREATE TABLE IF NOT EXISTS team_members(
                member_id INT AUTO_INCREMENT PRIMARY KEY,
                member_name VARCHAR(255),
                member_role VARCHAR(255),
                member_projects VARCHAR(255)
                )""";
        stmt.executeUpdate(sqlStatement);
    }

    private void generateData(Statement stmt) throws SQLException {
        String sqlQuery = "SELECT member_name, member_role FROM team_members";
        try (ResultSet resultSet = stmt.executeQuery(sqlQuery)) {
            if (!resultSet.next()) {
                String sqlStatement = """
                        INSERT INTO team_members(member_name, member_role)
                        VALUES ('Sarah', 'Full stack developer'),
                        ('Bobby', 'React developer'),
                        ('Ari', 'Java developer'),
                        ('Andrea', 'DevOps engineer'),
                        ('Bruno', 'IT operations')""";
                stmt.executeUpdate(sqlStatement);
            }
        }
    }
}
