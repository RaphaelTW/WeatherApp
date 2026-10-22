import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  let component: renderer.ReactTestRenderer;

  renderer.act(() => {
    component = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(component!.toJSON()).toMatchSnapshot();

  renderer.act(() => component!.unmount());
});
