---
title: Storage Buffer
source: https://doc.babylonjs.com/lite/architecture/47-storage-buffer/
section: Architecture
---

[API](https://doc.babylonjs.com/lite/typedoc/)

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Storage Buffer](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/)

…\|

[Babylon Lite](https://doc.babylonjs.com/lite/)\|

[Architecture](https://doc.babylonjs.com/lite/architecture/)\|

[Storage Buffer](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/)

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


# Module: Storage Buffer

### Table Of Contents

[Module: Storage Buffer](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#module-storage-buffer) [Purpose](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#purpose) [Public API Surface](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#public-api-surface) [Internal Architecture](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#internal-architecture) [Pipeline Configuration](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#pipeline-configuration) [Shader Logic](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#shader-logic) [State Machine / Lifecycle](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#state-machine--lifecycle) [Babylon.js Equivalence Map](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#babylonjs-equivalence-map) [Dependencies](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#dependencies) [Test Specification](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#test-specification) [File Manifest](https://doc.babylonjs.com/lite/architecture/47-storage-buffer/#file-manifest)

> Package path: `packages/babylon-lite/src/resource/storage-buffer.ts`

## Purpose

Expose shader-readable storage allocations without exposing raw WebGPU handles in the public API. The resource has stable identity so its contents can change without rebuilding material bind groups.

## Public API Surface

```ts
interface StorageBuffer {
    readonly byteLength: number;
}

function createStorageBuffer(engine: EngineContext, data: ArrayBufferView, label?: string): StorageBuffer;
function updateStorageBuffer(engine: EngineContext, buffer: StorageBuffer, data: ArrayBufferView, byteOffset?: number): void;
function disposeStorageBuffer(buffer: StorageBuffer): void;
```

`setShaderStorageBuffer(material, name, buffer)` accepts `StorageBuffer | null` for a storage declaration created by `createShaderMaterial`.

This replaces the previous raw `GPUBuffer` parameter. Migrate by wrapping initial data with
`createStorageBuffer`, updating it through `updateStorageBuffer`, and unbinding it before
`disposeStorageBuffer`.

## Internal Architecture

`StorageBuffer` is nominally branded plain state containing a public aligned byte capacity, retained CPU bytes,
and an internal `GPUBuffer`. Creation uses a mapped-at-creation `STORAGE | COPY_DST` allocation. Updates use
`queue.writeBuffer` and require four-byte-aligned offsets and lengths. The shader material stores the resource
object; the renderable unwraps the internal handle only while building a bind group.
Internal identity/lifecycle fields are non-enumerable, and every mutating/binding path verifies that the exact
wrapper remains registered with its owning engine; shallow copies cannot impersonate a live allocation.

The engine owns a lazy set of live storage buffers. Device-loss recovery recreates each internal handle from
the retained CPU bytes before scene renderables and bind groups are rebuilt. Bind-group creation rechecks
resource liveness and engine ownership. Engine disposal destroys all remaining live storage buffers, marks
their wrappers disposed, releases retained CPU bytes, and clears the lazy registry.
When the first storage buffer is created, the engine also retains its current storage-related WebGPU limits
(`maxBufferSize`, `maxStorageBufferBindingSize`, and `maxStorageBuffersPerShaderStage`) and requests them
again during device recovery. Those values are merged with any limits originally supplied to
`createEngine(..., { requiredLimits })`.

## Pipeline Configuration

The module creates no pipelines. Shader-material storage declarations continue to create read-only-storage bind-group-layout entries. Rebinding the same resource is a no-op, while binding a different resource increments the material resource version once.

## Shader Logic

None. The declaration's WGSL type remains owned by `ShaderStorageBufferDecl`.

## State Machine / Lifecycle

Create, optionally update any in-bounds range, bind to one or more shader materials, unbind, then dispose.
Disposal is idempotent. Updating or rebinding a disposed resource throws; a zero-length in-bounds update is a no-op.

## Babylon.js Equivalence Map

Equivalent in role to Babylon.js `StorageBuffer`: a high-level lifetime wrapper around a WebGPU storage allocation, with standalone functions matching Lite's pure-state API convention.

## Dependencies

`EngineContext`, internal GPU flag aliases, and the internal mapped-buffer upload helper.

## Test Specification

Unit tests verify creation flags and alignment, initial mapped upload, bounded aligned updates, hidden handle identity, idempotent disposal, and rejection of use after disposal.

## File Manifest

- `packages/babylon-lite/src/resource/storage-buffer.ts`
- `tests/lite/unit/storage-buffer.test.ts`
- `docs/lite/architecture/47-storage-buffer.md`

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