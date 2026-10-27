# Location picker

The header location control opens a city-search dialog inspired by the supplied screenshot and the live [Skill India Digital Hub](https://www.skillindiadigital.gov.in/home) Location popup (reviewed 28 October 2026). It retains the search field, five popular cities, and expandable city list, using WBF green glass styling. The landmark SVGs are original code drawings; no reference-site assets are copied.

The picker offers 43 Indian cities and familiar alternate names such as Bangalore/Bengaluru. Selecting a city shows matching published events and roles from the existing CMS and saves a city preference on this device when the visitor chooses “Use [city]”. It does not silently filter unrelated pages or represent cities as WBF branches. Where no local entries exist, it links to participation and contact pages. Existing published entries can include past activities, so results are labelled “Published activities & opportunities”.

The New Delhi office address is taken from the CMS organization record and matches WBF’s published [Contact Us page](https://wbfngo.org/contact/), verified 28 October 2026. Delhi matches also include explicit local addresses in the CMS: Khizrabad, New Friends Colony, Kalindi Kunj and Bharat Mandapam. Regional listings retain their original location labels.

The native modal supports focus containment, Escape, close-button and backdrop dismissal, focus return, scroll locking, search aliases, no-results feedback and storage-disabled browsing. Automated browser checks are in `tests/browser/location.spec.ts`.
