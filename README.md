<p align="center">
  <img src="Frontend/public/logo.jpeg" alt="Roastellar Logo" width="200" />
</p>

# Roastellar


[![Contracts CI](https://github.com/rupamghosh2006/Roastellar/actions/workflows/contracts-ci.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/contracts-ci.yml)
[![Backend CI/CD](https://github.com/rupamghosh2006/Roastellar/actions/workflows/backend-ci-cd.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/backend-ci-cd.yml)
[![Frontend CI/CD](https://github.com/rupamghosh2006/Roastellar/actions/workflows/frontend-ci-cd.yml/badge.svg)](https://github.com/rupamghosh2006/Roastellar/actions/workflows/frontend-ci-cd.yml)

Roastellar is a production-ready, on-chain roast-battle dApp on Stellar testnet. Players create and join battles, submit roasts, vote, make predictions, and receive transparent XLM outcomes.

- **Live application:** [roastellar.vercel.app](https://roastellar.vercel.app)
- **Public repository:** [github.com/rupamghosh2006/Roastellar](https://github.com/rupamghosh2006/Roastellar)
- **Stellar testnet contract:** [`CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA`](https://stellar.expert/explorer/testnet/contract/CBA5M4RLMEWHZ7CNKHA3P6HZ6WGXI7C7KY5TU7YMVZJH262FOAH6BBSA)
- **Pitch deck:** [View the Level 5 pitch deck](https://drive.google.com/file/d/11yevUYddMpD204HwPB4WqI1QxjTe9YIT/view?usp=sharing)
- **Demo video:** [Watch the complete product walkthrough](https://youtu.be/YNFZHxYcHtc)
- **Architecture:** [Read the production architecture](./ARCHITECTURE.md)
- **Security:** [Read the security checklist](./security_checklist.md)
- **Quick setup:** [Read the getting-started guide](./GettingStarted.md)
- **Community contribution:** [View Roastellar's community post on X](https://x.com/roastellar/status/2075922564699103709)

## Quick navigation

- [Product, mobile, monitoring, and transaction screenshots](#evidence-screenshots)
- [June Level 4 evidence](#june--level-4-evidence)
- [July 50+ user proof](#july-users-onboarded)
- [July feedback iteration summary](#feedback-matched-to-july-improvements)
- [Submission checklist](#submission-checklist)

## Demo video

[![Watch the Roastellar demo](https://img.youtube.com/vi/YNFZHxYcHtc/maxresdefault.jpg)](https://youtu.be/YNFZHxYcHtc)

> Click the preview to watch the full demo on YouTube.

## Evidence screenshots

### Product UI

<p align="center">
  <img src="Frontend/Screenshots/product_UI/auth_page.png" alt="Authentication page" width="32%" />
  <img src="Frontend/Screenshots/product_UI/dashboard_before_onbdoading.png" alt="Dashboard before onboarding" width="32%" />
  <img src="Frontend/Screenshots/product_UI/dashboard.png" alt="Dashboard" width="32%" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/product_UI/wallet.png" alt="Wallet" width="32%" />
  <img src="Frontend/Screenshots/product_UI/battle_page.png" alt="Battle page" width="32%" />
  <img src="Frontend/Screenshots/product_UI/battle_votingphase.png" alt="Battle voting phase" width="32%" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/product_UI/battle_report.png" alt="Battle report" width="32%" />
  <img src="Frontend/Screenshots/product_UI/leaderboard.png" alt="Leaderboard" width="32%" />
  <img src="Frontend/Screenshots/product_UI/profile.png" alt="Profile" width="32%" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/product_UI/txn_hash_links.png" alt="Transaction hash links" width="32%" />
</p>

### Mobile-responsive design

<p align="center">
  <img src="Frontend/Screenshots/mobile_view/web3_onboarding.jpg" alt="Mobile Web3 onboarding" width="180" />
  <img src="Frontend/Screenshots/mobile_view/dashboard_onboarding.jpg" alt="Mobile dashboard onboarding" width="180" />
  <img src="Frontend/Screenshots/mobile_view/wallet.jpg" alt="Mobile wallet" width="180" />
  <img src="Frontend/Screenshots/mobile_view/battle_page.jpg" alt="Mobile battle page" width="180" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/mobile_view/txn_records.jpg" alt="Mobile transaction records" width="180" />
  <img src="Frontend/Screenshots/mobile_view/battle_report.jpg" alt="Mobile battle report" width="180" />
  <img src="Frontend/Screenshots/mobile_view/leaderboard.jpg" alt="Mobile leaderboard" width="180" />
  <img src="Frontend/Screenshots/mobile_view/profile.jpg" alt="Mobile profile" width="180" />
</p>

### Monitoring and analytics

<p align="center">
  <img src="Frontend/Screenshots/monitoring_dashboard.png" alt="Monitoring dashboard" width="49%" />
  <img src="Frontend/Screenshots/metric_dashboard.png" alt="Metrics dashboard" width="49%" />
</p>

- **Health endpoint:** [roastellar.onrender.com/health](https://roastellar.onrender.com/health)
- **Metrics endpoint:** [roastellar.onrender.com/api/analytics/metrics](https://roastellar.onrender.com/api/analytics/metrics)

### Stellar transaction activity

<p align="center">
  <img src="Frontend/Screenshots/transaction_activity/ccontract_creation.png" alt="Contract creation" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/battle_creation.png" alt="Battle creation" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/player2_joins_onchain.png" alt="Second player joins on-chain" width="32%" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/transaction_activity/player_pays_entryfee.png" alt="Player pays entry fee" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/player_submit_roast.png" alt="Player submits roast" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/spectator_votes.png" alt="Spectator votes" width="32%" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/transaction_activity/spectator_predict_winner.png" alt="Spectator predicts winner" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/spectator_stakes_on_player.png" alt="Spectator stakes on player" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/battle_finalization1.png" alt="Battle finalization" width="32%" />
</p>

<p align="center">
  <img src="Frontend/Screenshots/transaction_activity/battle_finalization2.png" alt="Battle finalization outcome" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/winner_get_pot.png" alt="Winner receives pot" width="32%" />
  <img src="Frontend/Screenshots/transaction_activity/winning_prediction_payout.png" alt="Winning prediction payout" width="32%" />
</p>

## June — Level 4 evidence

The [June onboarding and feedback export](https://docs.google.com/spreadsheets/d/1rSuNXtO64Es7leAAnP5zJ5c3lW_7HQTvoOU-yRK8lsc/edit?usp=sharing) records the June-only cohort. Ten new users completed onboarding and supplied their Stellar wallet address; the transaction screenshots above provide the on-chain activity evidence.

| Name | Stellar wallet address | Onboarding date | Overall rating |
|---|---|---|---|
| Raunak Singh | `GDV7W3U4NX7X6Y5A23Z7B6M72VCLQ66PXZ7K6NY6L3I7Y42WW2DTEST3` | 29 Jun 2026 | 4/5 |
| RIJU DAS | `GD3KITJCXYGTNIQOH2O7TPZOG6HE2NRHKXZXSPMPWVLVQ6JI72HXMDZB` | 29 Jun 2026 | 5/5 |
| PRATIK DUBE | `GBV4DHWFLJQO6GHJXIN5S747EOXQGEEJA5BVOJHXLKD55XWHRUNWVV6Y` | 29 Jun 2026 | 5/5 |
| Shrikant Ajay Bhore | `GAGQ4AEPOYTJ2VLWXEWOTLVDMQNYW44CPHTK5LVHYERAL5AIOCDLEODU` | 30 Jun 2026 | 4/5 |
| DISHA PAL | `GC6JEOQTXDUZWQE6KTIFV5KKPT67UQR2SNILSZ6UZWZ5YYJRU27VYLRO` | 30 Jun 2026 | 3/5 |
| BIBHAS BANIK | `GCDTCISXKC2JPBNGHPAYFK3MFQBX5YHO4OV3F2MJHR3HI2NFEIQNFF2E` | 30 Jun 2026 | 5/5 |
| URMI CHATTERJEE | `GC35DTKVPAIFHUU7PYOBKDEIM5FRXBSHQIWZBASA2IFRPN7VEQ5YZC24` | 30 Jun 2026 | 5/5 |
| MANIK LAL | `GB5GF6NA6DFHBS6EZLNYTKKI6ODFHM6PD772VWTJMU7IRF5IO4ZFL526` | 30 Jun 2026 | 4/5 |
| SNEHA DAS | `GC4JRFZKUQQHXUE6BFDEQSYYP2YLSBS6MATKZJBJ3X2E56RGYLXWGO4X` | 30 Jun 2026 | 5/5 |
| Swarnali Rani Lodh | `GAH6LDNKDOMJK7FSM2ZH3NVUQZQQYFFPO3LWO27MFQLKF2DZ7K6QMWYN` | 30 Jun 2026 | 4/5 |

### June feedback summary and action taken

| Name | Stellar address | Feedback | Action taken | Commit |
|---|---|---|---|---|
| RIJU DAS | `GD3KITJCXYGTNIQOH2O7TPZOG6HE2NRHKXZXSPMPWVLVQ6JI72HXMDZB` | First sign-in showed a 404 instead of opening sign-up. | Detect the unknown-user error and route new users to sign-up. | [`41188a1`](https://github.com/rupamghosh2006/Roastellar/commit/41188a17ca6b2d663f0aaeca4d80c80b66865093) |
| BIBHAS BANIK | `GCDTCISXKC2JPBNGHPAYFK3MFQBX5YHO4OV3F2MJHR3HI2NFEIQNFF2E` | New user sign-in did not offer a sign-up option. | Same sign-in redirect fix. | [`41188a1`](https://github.com/rupamghosh2006/Roastellar/commit/41188a17ca6b2d663f0aaeca4d80c80b66865093) |
| Shrikant Ajay Bhore | `GAGQ4AEPOYTJ2VLWXEWOTLVDMQNYW44CPHTK5LVHYERAL5AIOCDLEODU` | Requested improved graphics. | Refreshed dashboard layout and visual styling. | [`0718c8a`](https://github.com/rupamghosh2006/Roastellar/commit/0718c8a9f2d01fec902225e22d1734828a51e997) |

## July — Level 5 user growth and feedback iteration

The [July feedback export (main submission sheet)](https://docs.google.com/spreadsheets/d/1atRXev5fF9Dq-ODOT9FWAxqzmgkQwYzoQnKAkh2ywaQ/edit?gid=869760851#gid=869760851) contains **51 responses** with an average product rating of **4.63/5**. The full form captures name, email, Stellar address, location, rating, and feedback; this README lists only the minimum public evidence needed for review.

### July users onboarded

| Name | Stellar wallet address | Rating |
|---|---|---|
| Souvik Mandal | `GA4SXARZZ4RPF6N7VOAH3B5OKMFAP3FGY6M6TO3DZJL4TMU2KOVBHCIY` | 5 |
| Milan Sen | `GDMO333LQVJ47MLF2IWDKBSL5FK3QMRSP67TVJYUB5DVNLQGHQS27V3P` | 5 |
| Samriddha Chaudhury | `GDZ33XIUXYBPLPQSFZZXNWVZ5XVFKAH47XOTN3IQZMCTRVLYEN3WAE23` | 4 |
| Ayan Jana | `GB4Y2KU5D5GCVSQSUDNGWQWVBEVU5L7H7V3TTVHKKLGAFZNNYFN74FRJ` | 5 |
| Lohit Mishra | `GDYWYDOBPPM2XFQS2N7OA2XYO66C24OSBDGASSYAU7V3V4UHFIQYWCRL` | 4 |
| Sadiya Mulani | `GCCQQTDVHNIB6INPIUS2F2VASHVH4NPWMIVX2LKFGAQY7LEU6EFISVNK` | 5 |
| dilah777 | `GDFFR6V53O4MASRZ7WS5MSKLBDDU3AMKBCJLTB52V5JR4FZKDWVBZZB7` | 5 |
| Somjit Dey | `GBFLQSKT3CKVIT5E4I5Y3RMTAKBOOWSXKNYIY5XJOWDTR74VZFQYOCQW` | 5 |
| Akash De | `GAEVFEJQNKN4233GVTXH4BNNP4FVTBEKK7ZQKMWTOEE6KVO6SNNVIBYI` | 5 |
| Bodhisatwa Dutta | `GCG34N562IX57PLLVKVC6LYQEK7VNX3HBR5KIECNT22MR5P7MOHN7ECW` | 5 |
| Meghmallar Hazra | `GA7NBKRRW2XRPZNW7QFFCVLKUFF3WM57LMFN5J5MDATRE2GYY6BPML56` | 5 |
| Snehasish Ghosh | `GAMZOSNLAMQ3VZLX2ZTULPSNVGXCANKSVREILMJBN4774RE7RRMZI6PM` | 5 |
| Anubrata Sarkar | `GDWW7FUYR7MAHDX2XICVXQPX6ELFDS74TWLQ7FGMKUFYT3CDUJFYOHFI` | 5 |
| Abhrajit Dey | `GBJCHUKZMTFSLOMNC7P4TS4VJJBTCYL3XKSOLXAUJSD56C4LHND5TWUC` | 5 |
| Argha Ghosh | `GBX5RI2SQPFNBXQLKA4TBUUUL2AZIA4QNEYK2C7WOXHJKOPOTQ24BWLS` | 5 |
| Aritra Banerjee | `GCY3OEI35PIKCJFUS7NNSLUN44NHYTKSY2CIWD4MHDO55JLOV3DMHB4Z` | 5 |
| Soumyajit Nandi | `GBHP74A56PRZAPTOFYUCNSARSLCVKWO3NY2LNBT6JSWCYQBD7DSSCYD5` | 5 |
| Soumyadeep Das | `GAPS4C574MHXGEFVOI5U7MV56IVL2SBTTR5OHRE4L3VTYSQXL32ZMQA6` | 5 |
| Bekir Erdem | `GBGHSPQEIZGJOJJDJYG5VVIPU7THJQU2Z4B6V5VF5IHUQ2SOLIRITDQS` | 4 |
| Debayan Adhikari | `GA7OKPRV5YHVFUWOV5FH2QPCLRAO42OCNEL3GVPQCISDNFDMJOGRIC32` | 4 |
| Payel Roy | `GDSXQOWYYUDEIIWAL5S5LJJV4XOHJIMXBJQJCJUYIVITO3GLXRP57A2T` | 5 |
| Sarnick Patra | `GCF4PIXE6HQRXYHN4O4BJHYKKKOADXTLTWYDP3CAKY5ZZHFWUVZUJBZW` | 5 |
| Debpriyo Ghosal | `GDU4D7BPCGXXELMXN32IFVXDPW5F5V3RBUVZQCCK3A5Y5QXMN3OL5ODR` | 5 |
| Rimon Kundu Chowdhury | `GDU3OPDKZ4UCL6MXKNWYPGHVGUR27G5XXEQSVKO2KT4LCCKB6BMHQZAA` | 5 |
| Abheek Samaddar | `GBBOQTHPXWVOMRNZUEDUKCNJDU4H6FFMTHLLUX4LSYV2ZYOKKXHZQE4E` | 5 |
| Nishant Singh | `GCX4DDJRY4BL4DV46NOOBBPNN5MTRI7J374G5JUR7YZJWAGTJRPTJ36C` | 4 |
| Debarpan Datta | `GA5KJBEWU5AUDW5T46M42FJFYVV4J4SU6MPTFIDH7Q4NQG63RV72RR7K` | 5 |
| Debansh Tiwari | `GBF6HZCMQE4DEDG2AR5OA6KGYFKTG4KINKPDNLLFU2KSBYJRUAIGKJC2` | 5 |
| Anish Mitra | `GBCTUOPFS5LHGBZ5QGYRVPOB2GRL4ASFJ4WB3W5TAQLQOLKM4GSBIEB3` | 4 |
| Sabuj Paul | `GAX74JTOIBQN5CLCWPMKKAFUJ7E2PNH3YSRILYX6J2KORKR2OCZ3F6TU` | 3 |
| Shivam Kumar | `GBA5ZVHMY7RHUFGPXDCDXEHVR654WBTDNRU3QRK5LZYDDW4JJECJIKUQ` | 4 |
| Ritabrata Sen | `GBZJC35OSNMPPHVP55HXGH4FUVTZR6SHXMKKQIECJUTPWLREO723IFIB` | 4 |
| Priyanshu Dey | `GCN7BQFYZHIUIJN6ZGPN5UBJS6LPOOIEGCYYNQW7LIESACTQNBROP4U2` | 5 |
| Anirban Chatterjee | `GBMEKOU6EA7ZQLZW6EH6725TULC4XAKVR4OURSEL45RKC6G2FQ7TGG7Y` | 4 |
| Sagnik Mukherjee | `GA5WBTNC4HAD2XADPLKLROPT3I6KXU2JODL2LXARJ2UH63I3Y4YSSBGW` | 5 |
| Rishav Ghoshal | `GA6YMO5EFILMMNXTGUJBAEJGP5NTYBQD3V37TPX7T46ZGG3RSOI5HTXI` | 5 |
| Debarghya Sinha | `GBCR5Z54YS4AFKT4ETUPY7I7T6B7ANS3XL5KZEIEYCUMN5FYJINDUPM2` | 5 |
| Arindam Majumdar | `GAJUZWH7ZF56LELGFYVJDVQIZQBI54ZNW7URCSYHIMDCP3CWGQH7TUL6` | 3 |
| Soham Chakraborty | `GA6X6C4GXEZSQZ2U234R2NMYOI5VWJTQDUU65GDXAY5KXSE6RVWO3NKA` | 4 |
| Koushik Bhattacharya | `GBW42XNFYJ462ECHUFS2YG66YQ3J2G62IFU332WSZIK3M4UIKTW3KQZE` | 5 |
| Aniket Roychowdhury | `GCTOLLNNEG7W5CEXXS7X5ZYLMUPDOR3S24XJYAAUAKMLFY6ABSOFW4JL` | 5 |
| Trisha Mukherjee | `GANWL5FLYBCGA5JMHYDDDUYAG7CKFPL34DOB2WCK5SSGBRNO6OTHI2NL` | 4 |
| Srijita Banerjee | `GDPEKKXTZXPCUH6LQHFXYL5GWARLZTJS7IL63UQNBERMOK24ZFM2GW4T` | 4 |
| Poulami Sen | `GBPFRD2QJORG3NA3DY3TDMVVL4BHDFI6KCV4RCXMA27OPGVRCDQNWNXS` | 5 |
| Ishita Majumdar | `GCVI3YYVKOAXZQKVKFMFJ5IMKZ5O3LTTGEYNZDPERDR7L2HULK5P3ZIQ` | 5 |
| Madhurima Dey | `GDQUNIFPDE6KNLKTG3S4TP4FV46MISPG2OIHXOWNVYHMNH5XI5G6VQ73` | 5 |
| Anwesha Sinha | `GDBYORG2Z2NXAZZDUUAQLXHBZR6MSU24RPGRQKGDM5V4XGAKAPR4TZYT` | 4 |
| Roshni Chakraborty | `GCHSF6S6C73SEBTFFLSZOPPAK6T3WXNAX6XI2NC6KTE5KAE4OYQMXAQS` | 5 |
| Tiyasha Ghoshal | `GAVCVHZGCEBZOLS2EIVQBCR75KZID2A3JZY7JOVLSCA4UEWVQ22TKT5L` | 4 |
| Oindrila Bhattacharya | `GDVSQMVYZX4JG65ESFNKZQXOBMDKNHYNNXTGTU5TF6TQXEM57IXNT3X2` | 4 |
| Pritha Roychowdhury | `GCDWVWQPWQRKM4GJA3ALM3CLT4DDN6QM7H3B62BJFSTMJLSIPVOV7M5H` | 5 |

### July improvements according to user feedback

| Name | Stellar address | Feedback | Solution delivered | Commit |
|---|---|---|---|---|
| Samriddha Chaudhury | `GDZ33XIUXYBPLPQSFZZXNWVZ5XVFKAH47XOTN3IQZMCTRVLYEN3WAE23` | “The UI could be a bit better.” | Refreshed the dashboard layout and styling. | [`0718c8a`](https://github.com/rupamghosh2006/Roastellar/commit/0718c8a9f2d01fec902225e22d1734828a51e997) |
| Lohit Mishra | `GDYWYDOBPPM2XFQS2N7OA2XYO66C24OSBDGASSYAU7V3V4UHFIQYWCRL` | Battle-room text was camouflaged by the background. | Applied battle/dashboard UI styling and readability refinements. | [`0718c8a`](https://github.com/rupamghosh2006/Roastellar/commit/0718c8a9f2d01fec902225e22d1734828a51e997) |
| Soumyadeep Das | `GAPS4C574MHXGEFVOI5U7MV56IVL2SBTTR5OHRE4L3VTYSQXL32ZMQA6` | Requested a smoother, more optimised mobile UI. | Refreshed responsive dashboard presentation and UX styling. | [`0718c8a`](https://github.com/rupamghosh2006/Roastellar/commit/0718c8a9f2d01fec902225e22d1734828a51e997) |
| Abheek Samaddar | `GBBOQTHPXWVOMRNZUEDUKCNJDU4H6FFMTHLLUX4LSYV2ZYOKKXHZQE4E` | “A bit more responsiveness would be great.” | Responsive UI and dashboard visual improvements. | [`0718c8a`](https://github.com/rupamghosh2006/Roastellar/commit/0718c8a9f2d01fec902225e22d1734828a51e997) |
| Anwesha Sinha | `GDBYORG2Z2NXAZZDUUAQLXHBZR6MSU24RPGRQKGDM5V4XGAKAPR4TZYT` | Mobile UI felt “a bit laggy.” | Optimised UI presentation and refreshed mobile-facing experience. | [`0718c8a`](https://github.com/rupamghosh2006/Roastellar/commit/0718c8a9f2d01fec902225e22d1734828a51e997) |
| Bekir Erdem | `GBGHSPQEIZGJOJJDJYG5VVIPU7THJQU2Z4B6V5VF5IHUQ2SOLIRITDQS` | Same-wallet Freighter login created a separate account; requested sharing the winning roast on X. | Resolve the managed wallet to the existing Google account; add share actions in battle results and profile history. | [`446bc78`](https://github.com/rupamghosh2006/Roastellar/commit/446bc78b535f2d5591826cfdcdc64a37a71f8897), [`9756000`](https://github.com/rupamghosh2006/Roastellar/commit/975600047bfbc54515c63f215366924f66de7378), [`b5155b5`](https://github.com/rupamghosh2006/Roastellar/commit/b5155b5afedc0073f86d2017c777637f517d2a63) |
| Anish Mitra | `GBCTUOPFS5LHGBZ5QGYRVPOB2GRL4ASFJ4WB3W5TAQLQOLKM4GSBIEB3` | Requested previous matches on the profile. | Added protected match-history API and profile history for played/voted battles. | [`5205cf7`](https://github.com/rupamghosh2006/Roastellar/commit/5205cf7e3ac90fdd71f802109a0ead3aef646e36) |
| Sabuj Paul | `GAX74JTOIBQN5CLCWPMKKAFUJ7E2PNH3YSRILYX6J2KORKR2OCZ3F6TU` | Google-created wallet then Freighter sign-in created a duplicate account. | Freighter lookup now resolves the existing Google account before any wallet-only account is used. | [`446bc78`](https://github.com/rupamghosh2006/Roastellar/commit/446bc78b535f2d5591826cfdcdc64a37a71f8897) |
| Shivam Kumar | `GBA5ZVHMY7RHUFGPXDCDXEHVR654WBTDNRU3QRK5LZYDDW4JJECJIKUQ` | Requested a profile-picture option. | Added custom PNG/JPEG/WebP profile pictures with Pinata storage, validation, and rate limiting. | [`567d174`](https://github.com/rupamghosh2006/Roastellar/commit/567d174a9b0aa7f8e27d83d3488cce3e0fb23f7f) |
| Ritabrata Sen | `GBZJC35OSNMPPHVP55HXGH4FUVTZR6SHXMKKQIECJUTPWLREO723IFIB` | After voting or staking, controls froze without clear participation state. | Lock completed vote/prediction actions, show completion state, and persist participation status after refresh. | [`7ab7331`](https://github.com/rupamghosh2006/Roastellar/commit/7ab73313e5ca326f0d7274aad02daf33d8dbc7b4), [`7a6b0bf`](https://github.com/rupamghosh2006/Roastellar/commit/7a6b0bf55368e8a4f59700b744cf2445e61f90c8) |

### Some add-on July product improvements

| Product improvement | Outcome | Commit |
|---|---|---|
| Re-onboarding flow | Prevent a completed user from being mistakenly sent through onboarding again. | [`a8ea9c0`](https://github.com/rupamghosh2006/Roastellar/commit/a8ea9c0d35f9f6d064509ccac638302dcfdb71c5) |
| Custom battle duration | Added extended voting time and creator-selected battle duration. | [`e0afa88`](https://github.com/rupamghosh2006/Roastellar/commit/e0afa88bf7ec7344412bce8f631905f7b1acf352) |
| Anonymous live voting | Removed per-player totals, leader highlighting, and prediction backing during live voting; retain only aggregate activity. | [`2d0fd76`](https://github.com/rupamghosh2006/Roastellar/commit/2d0fd76ce2b5e91a80673078aec1ed8737bf46fa) |
| Spectator-safe submission UI | Restrict the Roast Submission panel to the two battle players. | [`7c6eaf3`](https://github.com/rupamghosh2006/Roastellar/commit/7c6eaf37573058519f004c9cd3002a86347a2ab5) |
| Full leaderboard | Return every non-banned user when no limit is supplied. | [`212660c`](https://github.com/rupamghosh2006/Roastellar/commit/212660c129fda7c4e67b3e9eefa4112c034a1329) |
| Battle reports | Add a protected historical report with players, voters, predictions, payouts, Stellar Expert links, and transaction ledger. | [`c3349bc`](https://github.com/rupamghosh2006/Roastellar/commit/c3349bcfc0b98d7ffcfcd5a4504377f9a913d8af) |

## Submission checklist

- [x] Public GitHub repository
- [x] Minimum 20+ meaningful commits
- [x] Live deployed application
- [x] PPT/Pitch deck link
- [x] Demo video link
- [x] Proof of 50+ users
- [x] Screenshots of analytics or transaction activity
- [x] Updated README and documentation
- [x] User feedback iteration summary

## License

[MIT License](./LICENSE)
