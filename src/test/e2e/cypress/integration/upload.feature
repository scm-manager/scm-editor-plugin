Feature: Upload Files

  Background:
    Given User is authenticated
    And A git repository exists

  Scenario: Upload a file
    Given User has permission to read and write repository
    When User uploads a new file
    Then The folder containing the uploaded file is displayed

  Scenario: Upload multiple files
    Given User has permission to read and write repository
    When User uploads multiple new files
    Then The folder containing the uploaded files is displayed

  Scenario: There is an upload button
    Given User has permission to read and write repository
    When User visits code view of repository
    Then There is an upload file button

  Scenario: No upload button without permissions
    Given User has permission to read repository
    When User visits code view of repository
    Then There is no upload file button
