import { fetchNews } from '../newsService';

jest.mock('react-native-config', () => ({
  API_URL: 'http://mock-api',
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: () => Promise.resolve([{ id: '1', title: 'Test News', content: 'Test Content' }]),
  } as Response)
);

test('fetchNews returns news data', async () => {
  const news = await fetchNews('student');
  expect(news).toEqual([{ id: '1', title: 'Test News', content: 'Test Content' }]);
  expect(fetch).toHaveBeenCalledWith('http://mock-api/api/news?role=student');
});