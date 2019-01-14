import * as React from 'react'
import {
  render,
  cleanup,
  waitForDomChange,
  fireEvent,
} from 'react-testing-library'

import { createSettableState } from '@dwalter/spider-store'

import { SpiderRoot } from './SpiderRoot'
import { useActions } from './useActions'
import { useSelector, Selector } from './useSelector'
import { Fork } from './Fork'

afterEach(cleanup)

test('Testing the Fork component', async done => {
  const [numbers, setNumbers] = createSettableState([1, 2])

  let collectionRenderCount = 0
  let itemRenderCount = 0
  let actions = { setNumbers: (v: number[]) => {} }

  function Collection() {
    collectionRenderCount += 1
    actions = useActions({ setNumbers })
    return (
      <div data-testid="collection">
        <Fork selector={numbers as any} Component={Item as any} />
      </div>
    )
  }

  function Item({
    selector: getItem,
  }: {
    key: any
    selector: Selector<number>
  }) {
    itemRenderCount += 1
    const item = useSelector(getItem)

    return <div>{item}</div>
  }

  const { getByTestId, rerender } = render(
    <SpiderRoot>
      <Collection />
    </SpiderRoot>,
  )

  const component = getByTestId('collection')
  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(1)
  expect(itemRenderCount).toBe(2)

  rerender(
    <SpiderRoot>
      <Collection />
    </SpiderRoot>,
  )

  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(2)
  expect(itemRenderCount).toBe(4)

  actions.setNumbers([1, 3])

  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(2)
  expect(itemRenderCount).toBe(4)

  await waitForDomChange({ container: component })

  expect(component.children.length).toBe(2)
  expect(collectionRenderCount).toBe(2)
  expect(itemRenderCount).toBe(5)

  actions.setNumbers([1, 3, 2])
  await waitForDomChange({ container: component })

  expect(component.children.length).toBe(3)
  expect(collectionRenderCount).toBe(2)
  expect(itemRenderCount).toBe(6)

  done()
})
