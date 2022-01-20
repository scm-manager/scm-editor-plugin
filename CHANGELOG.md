# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.9.1 - 2022-01-07
### Fixed
- High contrast mode findings ([#58](https://github.com/scm-manager/scm-editor-plugin/pull/58))
- Make breadcrumb not clickable ([#57](https://github.com/scm-manager/scm-editor-plugin/pull/57))
- Redirect to non-empty parent folder or root if folder is empty after deleting a file ([#56](https://github.com/scm-manager/scm-editor-plugin/pull/56))

## 2.8.0 - 2021-12-22
### Added
- Enable renaming/moving of files and folders ([#55](https://github.com/scm-manager/scm-editor-plugin/pull/55))

## 2.7.1 - 2021-11-18
### Fixed
- Update plugin scripts to v1.2.2

## 2.7.0 - 2021-11-17
### Changed
- Validate file upload also if path changed ([#54](https://github.com/scm-manager/scm-editor-plugin/pull/54))
- Add alt text to button and links ([#50](https://github.com/scm-manager/scm-editor-plugin/pull/50))

## 2.6.0 - 2021-11-05
### Added
- Add extension points for download and upload actions ([#49](https://github.com/scm-manager/scm-editor-plugin/pull/49))
- Support for locked files ([#49](https://github.com/scm-manager/scm-editor-plugin/pull/49))

## 2.5.0 - 2021-10-21
### Added
- Check whether the latest revision has changed during edit ([#41](https://github.com/scm-manager/scm-editor-plugin/pull/41))

### Fixed
- Multiple fetches of content type ([#47](https://github.com/scm-manager/scm-editor-plugin/pull/47))

## 2.4.0 - 2021-10-07
### Changed
- EditorPreconditions and ChangeGuardCheck are now public api ([#46](https://github.com/scm-manager/scm-editor-plugin/pull/46))

## 2.3.1 - 2021-09-13
### Fixed
- Path encoding when working with files ([#42](https://github.com/scm-manager/scm-editor-plugin/pull/42))
- Edit buttons on non-head revisions ([#43](https://github.com/scm-manager/scm-editor-plugin/pull/43))

## 2.3.0 - 2021-07-21
### Added
- New files can be created in empty non-initiated repositories ([#39](https://github.com/scm-manager/scm-editor-plugin/pull/39))

## 2.2.1 - 2021-03-26
### Added
- Add e2e tests ([#28](https://github.com/scm-manager/scm-editor-plugin/pull/28))

### Fixed
- Validate path and filename to prevent path traversal ([#30](https://github.com/scm-manager/scm-editor-plugin/pull/30))

## 2.2.0 - 2020-10-27
### Added
- Source code fullscreen view ([#23](https://github.com/scm-manager/scm-editor-plugin/pull/23))

### Changed
- Use scm-code-editor-plugin for syntax highlighting ([#24](https://github.com/scm-manager/scm-editor-plugin/pull/24))

### Fixed
- Committing without an email address ([#22](https://github.com/scm-manager/scm-editor-plugin/pull/22))

## 2.1.1 - 2020-09-15
### Fixed
- Redundant URL encoding for branch in edit ([#21](https://github.com/scm-manager/scm-editor-plugin/pull/21))

## 2.1.0 - 2020-09-09
### Added
- Documentation in English and German ([#17](https://github.com/scm-manager/scm-editor-plugin/pull/17))
- Add extension point to show hints for files below the editor ([#20](https://github.com/scm-manager/scm-editor-plugin/pull/20))

## 2.0.0 - 2020-06-04
### Changed
- Rebuild for api changes from core

## 2.0.0-rc4 - 2020-04-14
### Changed
- Changeover to MIT license ([#15](https://github.com/scm-manager/scm-editor-plugin/pull/15))
- Ensure same monospace font-family throughout whole SCM-Manager ([#16](https://github.com/scm-manager/scm-editor-plugin/pull/16))

## 2.0.0-rc3 - 2020-03-13
### Added
- Add swagger rest annotations to generate openAPI specs for the scm-openapi-plugin. ([#14](https://github.com/scm-manager/scm-editor-plugin/pull/14))

## 2.0.0-rc2 - 2020-01-28
### Added
- Add pure json based create and modify rest endpoints ([#11](https://github.com/scm-manager/scm-editor-plugin/pull/11))
- add breadcrumb to file editor and file uploader
- Introduction of change guard, which allows plugins to prevent changes ([#12](https://github.com/scm-manager/scm-editor-plugin/pull/12))

### Changed
- redesign ui for file editor and file uploader to match code section better
- fix routing after major ux / ui redesign on code section
- First public release candidate

