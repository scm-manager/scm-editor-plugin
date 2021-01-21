Feature: Create Files

  Background:
    Given User is authenticated
    And A git repository exists

  Scenario: Create a file
    Given User has permission to read and write repository
    When User creates a new file
    Then The created file is displayed

  Scenario: There is a create button
    Given User has permission to read and write repository
    When User visits code view of repository
    Then There is a create file button

  Scenario: No create button without permissions
    Given User has permission to read repository
    When User visits code view of repository
    Then There is no create file button
