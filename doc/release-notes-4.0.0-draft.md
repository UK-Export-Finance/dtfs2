# 4.0.0 release notes draft

## Scope and review status

This unreleased draft includes only non-merge `feat:` and `fix:` commits from the complete `v3.2.0..main` range at the snapshot below. Chores and merge entries are intentionally excluded.
It includes parallel work developed on `main` that was missing from the new release PR. Review the final code diff and any reversions before publication.

- Baseline: `v3.2.0`, commit `85c7745282737a670e692c1af6e0c0c8583b7f6b`.
- Target snapshot: `main`, commit `a41c2254976b33b428bbdec712189cad0f63de7f`.
- [Complete comparison at this snapshot](https://github.com/UK-Export-Finance/dtfs2/compare/v3.2.0...a41c2254976b33b428bbdec712189cad0f63de7f).
- Release notes: 37 entries — 10 features and 27 fixes.
- All 37 feature/fix entries from [the old release PR #4800](https://github.com/UK-Export-Finance/dtfs2/pull/4800) are included below; only 2 appeared in the initial body of [PR #5006](https://github.com/UK-Export-Finance/dtfs2/pull/5006).

Refresh this draft against the actual release target before publication. It does not include commits made after the target snapshot.
If releasing from a release branch rather than `main`, use that branch's final SHA and its actual previous release tag.

This draft is independent of release-please's generated PR. The default generator's parallel-history omission still requires an automation fix; this document does not change that behavior.
GitHub-generated notes are not a substitute for commit-type filtering: PR labels can overlap, including features also labelled as chores.

## Features (10)

- feat(DTFS2-8437): create a gift facility - conditionally delay creation (#4795) ([22a5d74433](https://github.com/UK-Export-Finance/dtfs2/commit/22a5d744339d9a74cade1f53b6b09ff68384b396))
- feat(DTFS2-8352): create a gift facility - name formatting (#4799) ([171e9fd4fb](https://github.com/UK-Export-Finance/dtfs2/commit/171e9fd4fb6bb9407a7c2e1037977959cfa907fe))
- feat(DTFS2-8352-8353): create a gift facility - overview, obligation amounts (#4791) ([c08b5a576d](https://github.com/UK-Export-Finance/dtfs2/commit/c08b5a576dd7854dd294b1389311d6b74fac74e9))
- feat(DTFS2-19579): added workflow dispatch to bicep deployment (#4752) ([d7b44ef0b8](https://github.com/UK-Export-Finance/dtfs2/commit/d7b44ef0b858945494232ff0fd60cd2bdf925096))
- feat(DTFS2-25472): fix infra deployment pipeline dev1 (#4862) ([86f05561bd](https://github.com/UK-Export-Finance/dtfs2/commit/86f05561bd60421ce70d8edd74031bee3ccc365e))
- feat(DTFS2-8521): create an ewcs gift facility - counterparties (#4943) ([d4163cfcf6](https://github.com/UK-Export-Finance/dtfs2/commit/d4163cfcf6f10730b5dac783bfdc8e98f8621744))
- feat(DTFS2-8521): create an ewcs gift facility - category code (#4944) ([79b0b96d74](https://github.com/UK-Export-Finance/dtfs2/commit/79b0b96d74b43030047a4bf3e8857864e30313c1))
- feat(DTFS2-8553): create an ewcs gift facility - accrual schedule (#4951) ([9a76d193cf](https://github.com/UK-Export-Finance/dtfs2/commit/9a76d193cf59a9b16fa9e63bd3313652a57cd3c2))
- feat(DTFS2-8521): create an ewcs gift facility - product, name (#4955) ([d041ad188d](https://github.com/UK-Export-Finance/dtfs2/commit/d041ad188daf13986f126171b4bf6ef8c8cb2f16))
- feat(DTFS2-8542): amend a gift facility - multiple amendments (#4960) ([d7b4ffa989](https://github.com/UK-Export-Finance/dtfs2/commit/d7b4ffa989266c309070c4b9510ccee5d089569d))

## Bug Fixes (27)

- fix(DTFS2-8352): send a gift facility - gef name mapping (#4804) ([d165239783](https://github.com/UK-Export-Finance/dtfs2/commit/d165239783bdc3ad1510e2de8ce84063d9d6708c))
- fix(DTFS2-8353-8354): send a gift facility - obligation amount (#4805) ([fe1dfae776](https://github.com/UK-Export-Finance/dtfs2/commit/fe1dfae776e9010d5bbb1ac969715d2bbd3c711f))
- fix(DTFS2-8484): create a gift bss facility - obligation amount (#4815) ([17a019026a](https://github.com/UK-Export-Finance/dtfs2/commit/17a019026aea620bc66caf7aa5137a2c5b98704d))
- fix(DTFS2-8486): amend a gift facility - date conversion (#4816) ([9082463b7c](https://github.com/UK-Export-Finance/dtfs2/commit/9082463b7c7c250bba896fb125687fc9fd754036))
- fix(DTFS2-8494): create a gift facility - months of cover, facility name (#4823) ([f26835ee8c](https://github.com/UK-Export-Finance/dtfs2/commit/f26835ee8c2ea67bd715fc35195d2567056d4b1c))
- fix(DTFS2-8495): send a gift facility - accrual dates (#4839) ([b2028ac0b1](https://github.com/UK-Export-Finance/dtfs2/commit/b2028ac0b1d07a78dc28293fa1273425efeb5ec6))
- fix(DTFS2-8401): fix heading accessibility DAC_Info_and_relationships_02 (#4819) ([8006ec3fec](https://github.com/UK-Export-Finance/dtfs2/commit/8006ec3fecd246eb22e8d6aa679aa368e9b293d7))
- fix(DTFS2-8503): create a gift facility - intentional delay (#4847) ([882883f01a](https://github.com/UK-Export-Finance/dtfs2/commit/882883f01ae0c36aedb2ed418aa66341a9abf3d3))
- fix(DTFS2-8485): create a gift facility - obligation amount (#4848) ([2b8d69beec](https://github.com/UK-Export-Finance/dtfs2/commit/2b8d69beececb03c93872641a6866f10a54a3cd9))
- fix(DTFS2-8399): improve accessibility of dac-links-and-landmarks (#4849) ([92f8f11984](https://github.com/UK-Export-Finance/dtfs2/commit/92f8f11984367a7da61f50a1b03a267f76988fee))
- fix(DTFS2-8402): tfm accessibility fix dac-text-input-01 (#4822) ([a4053a0690](https://github.com/UK-Export-Finance/dtfs2/commit/a4053a0690fdb6a9e0a239c8e7d6f998c9113e73))
- fix(DTFS-16188): fix infrastructure and deployment issues (#4753) ([6485d8a706](https://github.com/UK-Export-Finance/dtfs2/commit/6485d8a7062c32b7d03838aa431642815909078a))
- fix(DTFS2-8432): tfm - amend a facility - auto approval - send to apim/gift (#4810) ([8091c57f52](https://github.com/UK-Export-Finance/dtfs2/commit/8091c57f528d63a35b266ac4ca431e07c7956595))
- fix(DTFS2-8431-8488): amend a gift facility - expiryDate mapping (#4894) ([402555479c](https://github.com/UK-Export-Finance/dtfs2/commit/402555479c766241382d0ea38c854b0edebadf90))
- fix(DTFS2-8527-8529): amend a gift facility - submittedByPim check (#4896) ([7d244b9050](https://github.com/UK-Export-Finance/dtfs2/commit/7d244b90502aa25d8bf9a1cf4baff904b9b0412b))
- fix(DTFS2-8532): amend gift facility amount - calculation (#4901) ([62149f4e34](https://github.com/UK-Export-Finance/dtfs2/commit/62149f4e34823520574c355baee712c5f388e6c4))
- fix(DTFS2-8533): amend a facility value - apim/gift effective date (#4900) ([6776d7ff2f](https://github.com/UK-Export-Finance/dtfs2/commit/6776d7ff2f58f4012dba2c0326cccf81c0a06f1b))
- fix(DTFS2-8530): amend a gift facility - sent to apim/gift check (#4903) ([102b71db71](https://github.com/UK-Export-Finance/dtfs2/commit/102b71db71416d032375c1b4bca1730c064321fb))
- fix(DTFS2-8538): amend a gift facility amount - cover percentage (#4905) ([40f4d51bde](https://github.com/UK-Export-Finance/dtfs2/commit/40f4d51bde8579fbd6a5d7f00cdaa2049e467f2f))
- fix(DTFS2-8432): amend a gift facility - fallback effective date (#4914) ([a6827fa2a4](https://github.com/UK-Export-Finance/dtfs2/commit/a6827fa2a4a7f26590b356d01a2a889a0df32297))
- fix(DTFS2-8432): amend a facility - apim/gift - manual amendment (#4927) ([546fc381a0](https://github.com/UK-Export-Finance/dtfs2/commit/546fc381a0a578f8dc0365925e76c5e19a70fc70))
- fix(DTFS2-8564): amend a gift facility amount - decimal points (#4935) ([260025791d](https://github.com/UK-Export-Finance/dtfs2/commit/260025791d078e2f5914c21bc21741c52279ec65))
- fix(DTFS2-8564): amend a gift facility - date/timezone issue (#4938) ([99670de3b9](https://github.com/UK-Export-Finance/dtfs2/commit/99670de3b9d28c429c6996d99dd3dc63754caa2f))
- fix(DTFS2-8403): checkbox accessibility fix DAC_Checkbox_01 (#4939) ([3743191ebb](https://github.com/UK-Export-Finance/dtfs2/commit/3743191ebb3802c9873411404a04b60d388be88f))
- fix(DTFS2-8591): send a facility to gift - gef urn checks, split up (#4977) ([71999901f4](https://github.com/UK-Export-Finance/dtfs2/commit/71999901f4375a9f8ad4381e11a4acd1c8f98258))
- fix(DTFS2-8583): send a facility to gift - exporter party urn check (#4978) ([a6a7743943](https://github.com/UK-Export-Finance/dtfs2/commit/a6a7743943ca3dc765ddf3a02076d8e45c00b45c))
- fix(DTFS2-8593): create a gift facility - ewcs urn, fee mapping (#4991) ([e77d976299](https://github.com/UK-Export-Finance/dtfs2/commit/e77d976299853eedec9e5e9722be50611196d657))