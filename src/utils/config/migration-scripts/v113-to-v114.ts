/**
 * Migration script from v113 to v114
 * - Drops the Jalapeno Cloud provider entry from `providersConfig` and points
 *   every providerId that was still set to one of its removed ids at the
 *   DeepSeek default instead, so no feature is left referencing a provider
 *   that no longer exists (the schema would reject the config outright).
 *
 * Idempotent: a config without a Jalapeno entry comes back by identity.
 *
 * IMPORTANT: the provider type, the replacement id, and the keys holding a
 * provider id are hardcoded inline. Migration scripts are frozen snapshots -
 * never import constants, helpers, or shared types.
 */
export function migrate(oldConfig: any): any {
  if (!oldConfig || typeof oldConfig !== "object" || Array.isArray(oldConfig)) {
    return oldConfig
  }

  const providersConfig = Array.isArray(oldConfig.providersConfig)
    ? oldConfig.providersConfig
    : null
  if (!providersConfig) {
    return oldConfig
  }

  const removedIds = new Set<string>()
  for (const provider of providersConfig) {
    if (provider?.provider === "jalapenocloud" && typeof provider.id === "string") {
      removedIds.add(provider.id)
    }
  }
  if (removedIds.size === 0) {
    return oldConfig
  }

  const replacementId = "deepseek-default"

  const remapProviderIds = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(remapProviderIds)
    }
    if (!value || typeof value !== "object") {
      return value
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if (key === "providerId" && typeof entry === "string" && removedIds.has(entry)) {
          return [key, replacementId]
        }
        if (key === "selectedProviderIds" && Array.isArray(entry)) {
          return [
            key,
            entry.map((id: any) =>
              typeof id === "string" && removedIds.has(id) ? replacementId : id,
            ),
          ]
        }
        return [key, remapProviderIds(entry)]
      }),
    )
  }

  const next = remapProviderIds(oldConfig)
  next.providersConfig = next.providersConfig.filter(
    (provider: any) => provider?.provider !== "jalapenocloud",
  )
  return next
}
