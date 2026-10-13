-- Separate database for API integration tests, so test runs never touch dev data.
CREATE DATABASE taskflow_test OWNER taskflow;
