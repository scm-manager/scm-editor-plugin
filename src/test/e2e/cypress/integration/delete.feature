Feature: Delete Files

  Background:
    Given User is authenticated

  Scenario: Delete readme file
    Given An initialized git repository exists
    And User has permission to read and write repository
    When User deletes file
    Then The file does not exist anymore

  Scenario: No delete button without permissions
    Given An initialized git repository exists
    And User has permission to read repository
    When User visits code view of a file in repository
    Then There is no delete file button
