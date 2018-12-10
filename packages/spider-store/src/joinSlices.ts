import { Slice, createSlice } from './slice'

export function joinSlices<V, S1>(
  s1: Slice<S1>,
  mapping: (s1: S1) => V,
): Slice<V>

export function joinSlices<V, S1, S2>(
  s1: Slice<S1>,
  s2: Slice<S2>,
  mapping: (s1: S1, s2: S2) => V,
): Slice<V>

export function joinSlices<V, S1, S2, S3>(
  s1: Slice<S1>,
  s2: Slice<S2>,
  s3: Slice<S3>,
  mapping: (s1: S1, s2: S2, s3: S3) => V,
): Slice<V>

export function joinSlices<V, S1, S2, S3, S4>(
  s1: Slice<S1>,
  s2: Slice<S2>,
  s3: Slice<S3>,
  s4: Slice<S4>,
  mapping: (s1: S1, s2: S2, s3: S3, s4: S4) => V,
): Slice<V>

export function joinSlices<V, S1, S2, S3, S4, S5>(
  s1: Slice<S1>,
  s2: Slice<S2>,
  s3: Slice<S3>,
  s4: Slice<S4>,
  s5: Slice<S5>,
  mapping: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => V,
): Slice<V>

export function joinSlices<V, S1, S2, S3, S4, S5, S6>(
  s1: Slice<S1>,
  s2: Slice<S2>,
  s3: Slice<S3>,
  s4: Slice<S4>,
  s5: Slice<S5>,
  s6: Slice<S6>,
  mapping: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => V,
): Slice<V>

export function joinSlices(...slices: any[]) {
  const mapping = slices.pop()
  return createSlice(slices, mapping)
}
