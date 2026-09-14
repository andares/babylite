---
title: Resource Pool
source: https://doc.babylonjs.com/lite/architecture/37-resource-pool/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Resource Pool](https://doc.babylonjs.com/lite/architecture/37-resource-pool/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Resource Pool](https://doc.babylonjs.com/lite/architecture/37-resource-pool/)

[Babylon.js](https://doc.babylonjs.com/) [Babylon Lite](https://doc.babylonjs.com/lite/)

Filter

Filter

- [Welcome](https://doc.babylonjs.com/lite/)

- [Getting Started](https://doc.babylonjs.com/lite/01-getting-started/)

- [Feature Comparison](https://doc.babylonjs.com/lite/02-feature-comparison/)

- [Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide/)

- [Playground](https://doc.babylonjs.com/lite/04-playground/)

- [Headless Null Engine](https://doc.babylonjs.com/lite/05-headless-null-engine/)

- [Architecture](https://doc.babylonjs.com/lite/architecture/00-overview/)


# Module: Resource Pool

### Table Of Contents

[Module: Resource Pool](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#module-resource-pool) [Purpose](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#public-api-surface) [Texture Ref Counting](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#texture-ref-counting) [Sampler Deduplication](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#sampler-deduplication) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#internal-architecture) [Texture Reference Counting](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#texture-reference-counting) [Sampler Deduplication](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#sampler-deduplication-1) [Memory Layout](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#memory-layout) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#pipeline-configuration) [Shader Logic](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#shader-logic) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#state-machine--lifecycle) [Texture Lifecycle](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#texture-lifecycle) [Sampler Lifecycle](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#sampler-lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/37-resource-pool/#file-manifest)

> Package path: `packages/babylon-lite/src/resource/`

## Purpose

Provides GPU resource lifecycle management: reference-counted texture ownership and deduplicated sampler creation. Ensures textures are destroyed exactly once when no longer referenced, and identical sampler configurations share a single `GPUSampler` instance per device.

## Public API Surface

### Texture Ref Counting

```typescript
/** Increment ref count on a Texture2D. First acquire sets count to 1. */
export function acquireTexture(tex: Texture2D): void;

/** Decrement ref count. Calls tex.texture.destroy() when count reaches 0.
 *  Returns true if the texture was destroyed. */
export function releaseTexture(tex: Texture2D): boolean;

/** Increment ref count on a raw GPUTexture (for env textures). */
export function acquireGPUTexture(tex: GPUTexture): void;

/** Decrement ref count on a raw GPUTexture. Destroys at 0.
 *  Returns true if the texture was destroyed. */
export function releaseGPUTexture(tex: GPUTexture): boolean;
```

### Sampler Deduplication

```typescript
/** Get or create a deduplicated sampler. Same config → same GPUSampler.
 *  Default: all nearest, clamp-to-edge, anisotropy 1. */
export function getOrCreateSampler(device: GPUDevice, desc?: GPUSamplerDescriptor): GPUSampler;

/** Clear sampler cache for a device. */
export function clearSamplerCache(device: GPUDevice): void;
```

## Internal Architecture

### Texture Reference Counting

Uses `WeakMap<GPUTexture, number>` for ref counts:

- **`_texRefs`**: Maps `GPUTexture` → reference count (number)
- `acquireTexture(tex)` / `acquireGPUTexture(tex)`: Increments count (defaults to 0 if not present, so first acquire → 1)
- `releaseTexture(tex)` / `releaseGPUTexture(tex)`: Decrements count (defaults to 1 if not present, so first release → 0 → destroy)
- At count 0: calls `tex.texture.destroy()` (Texture2D) or `tex.destroy()` (raw GPUTexture), deletes from WeakMap
- Returns `true` if destroyed, `false` if still referenced

**WeakMap rationale**: No memory leaks — if the `GPUTexture` object itself is GC'd (impossible while alive), the entry is automatically cleaned up. More importantly, WeakMap avoids needing explicit cleanup of the tracking map.

Two API variants:

- `acquireTexture` / `releaseTexture`: Takes `Texture2D` (the public API type), accesses `.texture` property for the underlying `GPUTexture`
- `acquireGPUTexture` / `releaseGPUTexture`: Takes raw `GPUTexture` directly (used internally for environment cubemaps, BRDF LUTs, etc.)

### Sampler Deduplication

Uses `WeakMap<GPUDevice, Map<string, GPUSampler>>` for per-device caching:

- **`_samplerCache`**: Maps device → descriptor-key → sampler
- Key format: `"minFilter:magFilter:mipmapFilter:addressModeU:addressModeV:addressModeW:maxAnisotropy"`
  - Example: `"linear:linear:nearest:clamp-to-edge:clamp-to-edge:clamp-to-edge:1"`
  - Defaults applied: nearest for filters, clamp-to-edge for address modes, 1 for anisotropy
- First call with a new key creates the sampler; subsequent calls return cached instance
- `clearSamplerCache(device)` removes all cached samplers for a device

**WeakMap<GPUDevice>** ensures the cache is automatically invalidated when a device is lost/destroyed without explicit cleanup.

### Memory Layout

No buffers or GPU memory managed. This module only tracks ownership via JavaScript-side data structures:

```javascript
_texRefs: WeakMap<GPUTexture, number>
  └── Key: GPUTexture instance
  └── Value: integer ref count

_samplerCache: WeakMap<GPUDevice, Map<string, GPUSampler>>
  └── Key: GPUDevice instance
  └── Value: Map from descriptor string key → GPUSampler
```

## Pipeline Configuration

N/A — No GPU pipelines. This module manages texture lifecycle and sampler creation.

## Shader Logic

N/A — No shaders.

## State Machine / Lifecycle

### Texture Lifecycle

```javascript
Texture created (loadTexture2D, createSolidTexture2D, etc.)
     │
     ▼
acquireTexture(tex) ──► refCount = 1
     │
     ├── acquireTexture(tex) ──► refCount++
     │
     ├── releaseTexture(tex) ──► refCount--
     │         │
     │         ├── refCount > 0: keep alive
     │         │
     │         └── refCount == 0: tex.texture.destroy(), return true
     │
     └── (GPUTexture GC'd if all JS refs gone — WeakMap entry auto-cleaned)
```

### Sampler Lifecycle

```javascript
getOrCreateSampler(device, desc)
     │
     ├── Cache hit: return existing GPUSampler
     │
     └── Cache miss: device.createSampler(desc), cache, return

clearSamplerCache(device)
     └── Delete all entries for device
```

## Babylon.js Equivalence Map

| Babylon.js | Babylon Lite |
| --- | --- |
| Babylon.js<br>`ThinEngine._samplerCache` | Babylon Lite<br>`_samplerCache` WeakMap + `getOrCreateSampler()` |
| Babylon.js<br>`Texture.dispose()` \+ `InternalTexture._references` | Babylon Lite<br>`acquireTexture()` / `releaseTexture()` ref counting |
| Babylon.js<br>`BaseTexture.releaseInternalTexture()` | Babylon Lite<br>`releaseGPUTexture()` |

## Dependencies

- `../texture/texture-2d.js` — `Texture2D` type (for `acquireTexture`/`releaseTexture` overloads)

## Test Specification

1. **Acquire/release basic**: Acquire once, release once → texture destroyed, returns true
2. **Multiple acquires**: Acquire 3 times, release 2 times → not destroyed; release 3rd → destroyed
3. **Default release**: Release without prior acquire → treats as count 1, destroys
4. **Sampler dedup**: Same descriptor returns same GPUSampler instance
5. **Sampler different desc**: Different descriptor returns different GPUSampler
6. **Sampler key**: Verify key includes all 7 descriptor fields with defaults
7. **Clear sampler cache**: Verify cache cleared; next call creates new sampler
8. **Device isolation**: Two devices maintain separate sampler caches
9. **GPUTexture variant**: Verify `acquireGPUTexture`/`releaseGPUTexture` work identically for raw textures

## File Manifest

| File | Purpose |
| --- | --- |
| File<br>`gpu-pool.ts` | Purpose<br>GPU resource pool: ref-counted texture ownership + deduplicated sampler factory |

[![Babylon.js logo](https://doc.babylonjs.com/img/babylonidentity.svg)](https://doc.babylonjs.com/lite/)

[Babylon.js](https://doc.babylonjs.com/) [Babylon Lite](https://doc.babylonjs.com/lite/)

Filter

Filter

- [Welcome](https://doc.babylonjs.com/lite/)

- [Getting Started](https://doc.babylonjs.com/lite/01-getting-started/)

- [Feature Comparison](https://doc.babylonjs.com/lite/02-feature-comparison/)

- [Porting Guide](https://doc.babylonjs.com/lite/03-porting-guide/)

- [Playground](https://doc.babylonjs.com/lite/04-playground/)

- [Headless Null Engine](https://doc.babylonjs.com/lite/05-headless-null-engine/)

- [Architecture](https://doc.babylonjs.com/lite/architecture/00-overview/)