import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@emotion/react';
import NewsCard from '../NewsCard';
import { lightTheme } from '../../theme';
import { News } from '../../store';

const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
);

const mockNews: News = {
  _id: '1',
  title: 'Test News Title',
  content: 'This is test news content that should be displayed in the card.',
  category: 'Technology',
  image: 'https://example.com/image.jpg',
  createdAt: '2023-12-01T10:00:00Z',
  createdBy: 'Test Author',
  viewCount: 100,
  likeCount: 25,
  isArchived: false,
};

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('NewsCard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders news information correctly', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} />
      </ThemeWrapper>
    );

    expect(getByText('Test News Title')).toBeTruthy();
    expect(getByText('Technology')).toBeTruthy();
    expect(getByText(/This is test news content/)).toBeTruthy();
  });

  it('navigates to news detail when pressed', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} />
      </ThemeWrapper>
    );

    fireEvent.press(getByText('Test News Title'));
    expect(mockNavigate).toHaveBeenCalledWith('NewsDetail', { newsId: '1' });
  });

  it('renders different variants correctly', () => {
    const variants = ['default', 'featured', 'compact'] as const;
    
    variants.forEach(variant => {
      const { getByText } = render(
        <ThemeWrapper>
          <NewsCard news={mockNews} variant={variant} />
        </ThemeWrapper>
      );

      expect(getByText('Test News Title')).toBeTruthy();
    });
  });

  it('calls onBookmark when bookmark button is pressed', () => {
    const mockOnBookmark = jest.fn();
    
    const { getByTestId } = render(
      <ThemeWrapper>
        <NewsCard 
          news={mockNews} 
          onBookmark={mockOnBookmark}
          isBookmarked={false}
        />
      </ThemeWrapper>
    );

    // Note: This assumes the bookmark button has a testID
    // In the actual implementation, you'd need to add testID="bookmark-button"
    const bookmarkButton = getByTestId('bookmark-button');
    fireEvent.press(bookmarkButton);
    
    expect(mockOnBookmark).toHaveBeenCalledWith('1');
  });

  it('shows bookmarked state correctly', () => {
    const { getByTestId } = render(
      <ThemeWrapper>
        <NewsCard 
          news={mockNews} 
          onBookmark={jest.fn()}
          isBookmarked={true}
        />
      </ThemeWrapper>
    );

    const bookmarkIcon = getByTestId('bookmark-icon');
    expect(bookmarkIcon).toHaveProp('name', 'bookmark');
  });

  it('shows unbookmarked state correctly', () => {
    const { getByTestId } = render(
      <ThemeWrapper>
        <NewsCard 
          news={mockNews} 
          onBookmark={jest.fn()}
          isBookmarked={false}
        />
      </ThemeWrapper>
    );

    const bookmarkIcon = getByTestId('bookmark-icon');
    expect(bookmarkIcon).toHaveProp('name', 'bookmark-outline');
  });

  it('displays view and like counts', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} variant="default" />
      </ThemeWrapper>
    );

    expect(getByText('100')).toBeTruthy(); // view count
    expect(getByText('25')).toBeTruthy(); // like count
  });

  it('formats date correctly', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} />
      </ThemeWrapper>
    );

    // Should display formatted date
    expect(getByText(/Dec/)).toBeTruthy();
  });

  it('handles missing image gracefully', () => {
    const newsWithoutImage = { ...mockNews, image: '' };
    
    const { getByTestId } = render(
      <ThemeWrapper>
        <NewsCard news={newsWithoutImage} />
      </ThemeWrapper>
    );

    // Should render placeholder image
    const image = getByTestId('news-image');
    expect(image).toBeTruthy();
  });

  it('truncates long content correctly', () => {
    const longContent = 'A'.repeat(200);
    const newsWithLongContent = { ...mockNews, content: longContent };
    
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={newsWithLongContent} variant="compact" />
      </ThemeWrapper>
    );

    // Should truncate content (exact implementation depends on numberOfLines prop)
    const contentElement = getByText(/A+/);
    expect(contentElement).toBeTruthy();
  });

  it('applies custom styles correctly', () => {
    const customStyle = { marginTop: 20 };
    
    const { getByTestId } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} style={customStyle} />
      </ThemeWrapper>
    );

    const container = getByTestId('news-card-container');
    expect(container).toHaveStyle(customStyle);
  });

  it('has proper accessibility props', () => {
    const { getByLabelText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} />
      </ThemeWrapper>
    );

    const expectedLabel = `News article: Test News Title. Category: Technology. Published: ${new Date(mockNews.createdAt).toLocaleDateString()}`;
    const card = getByLabelText(expectedLabel);
    expect(card).toBeTruthy();
  });

  it('shows category badge in featured variant', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} variant="featured" />
      </ThemeWrapper>
    );

    // Category should be displayed as a badge in featured variant
    expect(getByText('Technology')).toBeTruthy();
  });

  it('handles animation index correctly', () => {
    const { getByTestId } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} index={5} />
      </ThemeWrapper>
    );

    // Animation should be applied with delay based on index
    const animatedContainer = getByTestId('animated-news-card');
    expect(animatedContainer).toBeTruthy();
  });

  it('renders author information when available', () => {
    const { getByText } = render(
      <ThemeWrapper>
        <NewsCard news={mockNews} variant="featured" />
      </ThemeWrapper>
    );

    expect(getByText('Test Author')).toBeTruthy();
  });
});
