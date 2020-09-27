# Redux Style Guide

## Introduction

- recommended patterns, best practices, and suggedsted approaches for writing Redux applications.
- list of recommentdations to help you avoid errors, bikeshedding, and anti-patterns.

## Rule Categories

- priority A : Essential
- priority B : Strongly Recommended
- priority C : Recommended

## Priority A Rules : Essential

- ### _Do Not Mutate State_
  Actual mutation of state values should always be avoided.
  (mutating state -> bugs (failing re-rebder, break time-travel debugging))
