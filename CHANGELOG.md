# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

-   Add sandbox for testing usaspending.gov endpoint
    [#10](https://github.com/azavea/green-equity-demo/pull/10)
-   Add US state boundary GeoJSON
    [#6](https://github.com/azavea/green-equity-demo/pull/6)
-   Add redux store and RTK query API client
    [#15](https://github.com/azavea/green-equity-demo/pull/15)
-   Add leaflet and US States
    [#16](https://github.com/azavea/green-equity-demo/pull/16)
-   Add per-capita map markers
    [#27](https://github.com/azavea/green-equity-demo/pull/27)
-   Add per-capita map legend
    [#29](https://github.com/azavea/green-equity-demo/pull/29)
-   Add state data tooltips
    [#36](https://github.com/azavea/green-equity-demo/pull/36)
-   Add bar charts to state data tooltips
    [#42](https://github.com/azavea/green-equity-demo/pull/42)
-   Add budget tracker
    [#34](https://github.com/azavea/green-equity-demo/pull/34)
-   Add spending category selector
    [#30](https://github.com/azavea/green-equity-demo/pull/30)
-   Add spending and state data fetching scripts
    [#40](https://github.com/azavea/green-equity-demo/pull/40)
-   Add Github Pages deploy to CI workflow
    [#48](https://github.com/azavea/green-equity-demo/pull/48)
-   Add data attribution section
    [#49](https://github.com/azavea/green-equity-demo/pull/49)
-   Add additional lato font weights for Chakra UI
    [#55](https://github.com/azavea/green-equity-demo/pull/55)
-   Integrate real spending by month data
    [#60](https://github.com/azavea/green-equity-demo/pull/60)
-   Add animated spending arc to map
    [#75](https://github.com/azavea/green-equity-demo/pull/75)
-   Add point data fetch script
    [#77](https://github.com/azavea/green-equity-demo/pull/77)
-   Lazy load high-res state boundaries
    [#82](https://github.com/azavea/green-equity-demo/pull/82)
-   Add disadvantaged communities choropleth map
    [#100](https://github.com/azavea/green-equity-demo/pull/100)

### Changed

-   Use Closes # in PR template
    [#9](https://github.com/azavea/green-equity-demo/pull/9)
-   Change map to Albers USA projection
    [#31](https://github.com/azavea/green-equity-demo/pull/31)
-   Place state markers at the points farthest from edges
    [#45](https://github.com/azavea/green-equity-demo/pull/45)
-   Show only selected category data in tooltip
    [#61](https://github.com/azavea/green-equity-demo/pull/61)
-   Make site more responsive
    [#62](https://github.com/azavea/green-equity-demo/pull/62)
-   Convert per-capita map to choropleth
    [#69](https://github.com/azavea/green-equity-demo/pull/69)
-   Make other category remainder of spending
    [#71](https://github.com/azavea/green-equity-demo/pull/71)
-   Update budget tracker style
    [#89](https://github.com/azavea/green-equity-demo/pull/89)
-   Change color palette to green
    [#102](https://github.com/azavea/green-equity-demo/pull/102)
-   Change animated map to use per-capita data
    [#96](https://github.com/azavea/green-equity-demo/pull/96)
-   Place category spending percentages directly next to bars
    [#103](https://github.com/azavea/green-equity-demo/pull/103)
-   Recolor state borders [#110](https://github.com/azavea/green-equity-demo/pull/110)
-   Make money travel curves go 'up' [#112](https://github.com/azavea/green-equity-demo/pull/112)

### Fixed

-   Fix layout issues [#53](https://github.com/azavea/green-equity-demo/pull/53)
-   Fix tooltip percentage calculations and improve agency lookups
    [#54](https://github.com/azavea/green-equity-demo/pull/54)
-   Fix various minor things
    [#84](https://github.com/azavea/green-equity-demo/pull/84)
-   Reposition animated spending bucket over DC
    [#85](https://github.com/azavea/green-equity-demo/pull/85)
-   Optimize arc animation [#97](https://github.com/azavea/green-equity-demo/pull/97)

### Removed
