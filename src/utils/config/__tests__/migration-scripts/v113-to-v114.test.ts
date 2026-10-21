import { describe, expect, it } from "vitest"
import { configSchema } from "@/types/config/config"
import { DEFAULT_CONFIG } from "@/utils/constants/config"
import { migrate } from "../../migration-scripts/v113-to-v114"

function configWithJalapeno(): any {
  return {
    pageTranslation: {
      providerId: "jalapenocloud-default",
      mode: "bilingual",
    },
    inputTranslation: {
      providerId: "microsoft-translate-default",
    },
    translationHub: {
      selectedProviderIds: ["jalapenocloud-default", "openai-default"],
    },
    providersConfig: [
      {
        id: "jalapenocloud-default",
        name: "Jalapeno Cloud",
        enabled: true,
        provider: "jalapenocloud",
        baseURL: "https://api.jalapeno-cloud.ai/v1",
      },
      {
        id: "microsoft-translate-default",
        enabled: true,
        provider: "microsoft-translate",
      },
    ],
  }
}

describe("v113-to-v114 migration", () => {
  it("drops the Jalapeno Cloud provider entry", () => {
    const migrated = migrate(configWithJalapeno())

    expect(migrated.providersConfig).toEqual([
      {
        id: "microsoft-translate-default",
        enabled: true,
        provider: "microsoft-translate",
      },
    ])
  })

  it("points a feature set up with it at the DeepSeek default", () => {
    const migrated = migrate(configWithJalapeno())

    expect(migrated.pageTranslation.providerId).toBe("deepseek-default")
  })

  it("rewrites the hub's selected provider ids in place", () => {
    const migrated = migrate(configWithJalapeno())

    expect(migrated.translationHub.selectedProviderIds).toEqual([
      "deepseek-default",
      "openai-default",
    ])
  })

  it("leaves providers and features that never mentioned it alone", () => {
    const migrated = migrate(configWithJalapeno())

    expect(migrated.inputTranslation.providerId).toBe("microsoft-translate-default")
    expect(migrated.providersConfig[0]).toEqual(configWithJalapeno().providersConfig[1])
  })

  it("does not touch the config it was given", () => {
    const oldConfig = configWithJalapeno()
    const snapshot = structuredClone(oldConfig)

    migrate(oldConfig)

    expect(oldConfig).toEqual(snapshot)
  })

  it("is idempotent", () => {
    const migrated = migrate(configWithJalapeno())

    expect(migrate(migrated)).toBe(migrated)
  })

  it("returns a config without providersConfig by identity", () => {
    const oldConfig = { pageTranslation: { providerId: "jalapenocloud-default" } }

    expect(migrate(oldConfig)).toBe(oldConfig)
  })

  it("gives a config that the v114 schema accepts", () => {
    const config = {
      ...DEFAULT_CONFIG,
      providersConfig: migrate(structuredClone(DEFAULT_CONFIG)).providersConfig,
      pageTranslation: {
        ...DEFAULT_CONFIG.pageTranslation,
        providerId: "deepseek-default",
      },
    }

    expect(configSchema.safeParse(config).success).toBe(true)
  })
})
