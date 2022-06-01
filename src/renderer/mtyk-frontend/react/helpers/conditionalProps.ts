import React, { useEffect, useState, ComponentProps } from 'react'

export default function conditionalProps<T>(value: boolean, props: T): T | {} {
  return value ? props : {}
}
