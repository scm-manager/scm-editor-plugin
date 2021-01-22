Feature: Delete Files

  Background:
    Given User is authenticated

  Scenario: Edit readme file
    Given An initialized git repository exists
    And User has permission to read and write repository
    When User edits file
    Then The updated file is displayed

  Scenario: No edit button without permissions
    Given An initialized git repository exists
    And User has permission to read repository
    When User visits code view of a file in repository
    Then There is no edit file button
