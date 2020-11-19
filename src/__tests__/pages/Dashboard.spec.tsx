import React from 'react';

import MockAdapter from 'axios-mock-adapter';

import { render, fireEvent, act } from '@testing-library/react';

import api from '../../services/api';

import Dashboard from '../../pages/Dashboard';

const mock = new MockAdapter(api);

const wait = (amount = 0): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, amount));
};

const actWait = async (amount = 0): Promise<void> => {
  await act(async () => {
    await wait(amount);
  });
};

describe('Dashboard page', () => {
  it('should be able to load files', async () => {
    const { container } = render(<Dashboard />);

    mock.onGet('/files').reply(200, [
      {
        id: 'teste-file-id',
        url: 'https://csvtestpath.com/test.csv',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
      {
        id: 'teste-file-id',
        url: 'https://csvtestpath.com/test.csv',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
    ]);

    await actWait();

    expect(container.querySelector('.select__single-value')).toHaveTextContent(
      '11/18/2020, 11:04:15 PM - https://csvtestpath.com/test.csv',
    );
  });

  it('should be able to get points', async () => {
    const { container } = render(<Dashboard />);

    mock.onGet(new RegExp(`/points/*`)).reply(200, [
      {
        id: 'test-point1-id',
        point: {
          type: 'Point',
          coordinates: [-30, 60],
        },
        fileId: 'test-file-id',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
      {
        id: 'test-point2-id',
        point: {
          type: 'Point',
          coordinates: [-30, 60],
        },
        fileId: 'test-file-id',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
    ]);

    await actWait();

    expect(
      container.querySelector('.leaflet-marker-pane')?.childElementCount,
    ).toBe(2);
  });

  it('should be able to add a file', async () => {
    const { getByTestId } = render(<Dashboard />);

    mock.onPost('/files').reply(200, {
      file: {
        id: 'teste-file2-id',
        url: 'https://csvtestpath.com/test2.csv',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
      geographicPoints: [
        {
          id: 'test-point1-id',
          point: {
            type: 'Point',
            coordinates: [-30, 60],
          },
          fileId: 'test-file2-id',
          createdAt: '2020-11-19T02:04:15.276Z',
          updatedAt: '2020-11-19T02:04:15.276Z',
        },
      ],
    });

    mock.onGet(new RegExp(`/points/*`)).reply(200, [
      {
        id: 'test-point1-id',
        point: {
          type: 'Point',
          coordinates: [-30, 60],
        },
        fileId: 'test-file2-id',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
    ]);

    const csvPathField = getByTestId('csv-path-input');

    const addButton = getByTestId('csv-path-button');

    fireEvent.change(csvPathField, {
      target: { value: 'https://path.com/example.csv' },
    });

    await actWait();

    expect(csvPathField).toHaveValue('https://path.com/example.csv');

    fireEvent.click(addButton);

    await actWait();

    expect(csvPathField).toHaveValue('');
  });

  it('should not be able to add a file with invalid url', async () => {
    const { getByTestId, container } = render(<Dashboard />);

    mock.onPost('/files').reply(200, {
      file: {
        id: 'teste-file3-id',
        url: 'invalidurl',
        createdAt: '2020-11-19T02:04:15.276Z',
        updatedAt: '2020-11-19T02:04:15.276Z',
      },
      geographicPoints: [
        {
          id: 'test-point1-id',
          point: {
            type: 'Point',
            coordinates: [-30, 60],
          },
          fileId: 'test-file3-id',
          createdAt: '2020-11-19T02:04:15.276Z',
          updatedAt: '2020-11-19T02:04:15.276Z',
        },
      ],
    });

    const csvPathField = getByTestId('csv-path-input');

    const addButton = getByTestId('csv-path-button');

    fireEvent.change(csvPathField, {
      target: { value: 'invalidurl' },
    });

    await actWait();

    expect(csvPathField).toHaveValue('invalidurl');

    fireEvent.click(addButton);

    await actWait();

    expect(
      container.querySelector('.select__single-value'),
    ).not.toHaveTextContent('11/18/2020, 11:04:15 PM - invalidurl');
  });
});
