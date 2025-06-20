/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
/* eslint-disable */
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
import type { Image, Audio } from "@boundaryml/baml"

/**
 * Recursively partial type that can be null.
 *
 * @deprecated Use types from the `partial_types` namespace instead, which provides type-safe partial implementations
 * @template T The type to make recursively partial.
 */
export type RecursivePartialNull<T> = T extends object
    ? { [P in keyof T]?: RecursivePartialNull<T[P]> }
    : T | null;

export interface Checked<T,CheckName extends string = string> {
    value: T,
    checks: Record<CheckName, Check>,
}


export interface Check {
    name: string,
    expr: string
    status: "succeeded" | "failed"
}

export function all_succeeded<CheckName extends string>(checks: Record<CheckName, Check>): boolean {
    return get_checks(checks).every(check => check.status === "succeeded")
}

export function get_checks<CheckName extends string>(checks: Record<CheckName, Check>): Check[] {
    return Object.values(checks)
}
export interface CodeExample {
  code: string
  language: string
  description?: string | null
  
}

export interface Error {
  url: string
  error: string
  
}

export interface InputSearchResult {
  url: string
  title: string
  content: string
  
}

export interface PracticalApplication {
  relevanceScore: number
  relevanceSummary: string
  keyTakeaways: string[]
  actionableItems?: string[] | null
  relatedConcepts?: string[] | null
  
}

export interface RelevanceResult {
  searchResults: SearchResult[]
  
}

export interface SearchResult {
  url: string
  title: string
  relevanceScore?: number | null
  
}

export interface Section {
  title: string
  summary: string
  codeExamples?: CodeExample[] | null
  keyPoints?: string[] | null
  userRelevance?: string | null
  refernceUrls?: string[] | null
  
}

export interface SummaryResult {
  urls: string[]
  errors?: Error[] | null
  title?: string | null
  topic?: string | null
  summary?: string | null
  tags?: string[] | null
  sections?: Section[] | null
  practicalApplication?: PracticalApplication | null
  
}
