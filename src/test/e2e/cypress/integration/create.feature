Feature: Create Files

Background:
  Given User is authenticated
  And A git repository exists

Scenario: Create a file
  Given User has permission to read and write repository
  When User creates a new file
  Then The created file is displayed
