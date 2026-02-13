package com.example;

import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Repository
public class UserRepository {

    private final DataSource dataSource;

    public UserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        String sqlStatement = "SELECT member_name, member_role FROM team_members";

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(sqlStatement)) {

            while (rs.next()) {
                User user = new User();
                user.setName(rs.getString("member_name"));
                user.setRole(rs.getString("member_role"));
                users.add(user);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    public void updateUsers(List<User> users) {
        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()) {

            users.forEach(user -> {
                String sqlStatement = String.format("UPDATE team_members SET member_role='%s' WHERE member_name='%s'",
                        user.getRole(), user.getName());
                try {
                    stmt.executeUpdate(sqlStatement);
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
