import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import styled from '@emotion/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppStore, News } from '../store';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { fetchNews } from '../services/newsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our modern component library
import {
  Screen,
  Container,
  Row,
  Column,
  Header,
  Typography,
  Card,
  Button,
  OptimizedFlatList,
  LoadingSpinner,
  NewsCard,
} from '../components';

// Modern styled components for Search Screen
const SearchContainer = styled.View`
  background-color: ${(props) => props.theme.surface};
  padding: ${(props) => props.theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.divider};
`;

const SearchInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.background};
  border: 2px solid ${(props) => props.theme.border};
  border-radius: ${(props) => props.theme.borderRadius.xl}px;
  padding: ${(props) => props.theme.spacing.sm}px ${(props) => props.theme.spacing.md}px;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: ${(props) => props.theme.typography.fontSize.base}px;
  color: ${(props) => props.theme.text.primary};
  margin-left: ${(props) => props.theme.spacing.sm}px;
  margin-right: ${(props) => props.theme.spacing.sm}px;
`;

const FilterButton = styled(TouchableOpacity)<{ active: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) =>
    props.active ? props.theme.primary : props.theme.cardBackground};
  padding: ${(props) => props.theme.spacing.sm}px ${(props) => props.theme.spacing.md}px;
  border-radius: ${(props) => props.theme.borderRadius.full}px;
  margin-right: ${(props) => props.theme.spacing.sm}px;
  border: 1px solid ${(props) =>
    props.active ? props.theme.primary : props.theme.border};
`;

const FilterModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: flex-end;
`;

const FilterModalContent = styled.View`
  background-color: ${(props) => props.theme.cardBackground};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: ${(props) => props.theme.spacing.xl}px;
  max-height: 75%;
  shadow-color: #000;
  shadow-offset: 0px -8px;
  shadow-opacity: 0.15;
  shadow-radius: 16px;
  elevation: 12;
`;

const FilterSection = styled.View`
  margin-bottom: ${(props) => props.theme.spacing.xl}px;
  padding: ${(props) => props.theme.spacing.lg}px;
  background-color: ${(props) => props.theme.surface};
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.border};
`;

const FilterChip = styled(TouchableOpacity)<{ selected: boolean }>`
  background-color: ${(props) =>
    props.selected ? props.theme.primary : props.theme.cardBackground};
  padding: ${(props) => props.theme.spacing.md}px ${(props) => props.theme.spacing.lg}px;
  border-radius: 20px;
  margin-right: ${(props) => props.theme.spacing.sm}px;
  margin-bottom: ${(props) => props.theme.spacing.md}px;
  border: 2px solid ${(props) =>
    props.selected ? props.theme.primary : props.theme.border};
  shadow-color: ${(props) => props.selected ? props.theme.primary : '#000'};
  shadow-offset: 0px ${(props) => props.selected ? 4 : 2}px;
  shadow-opacity: ${(props) => props.selected ? 0.2 : 0.08};
  shadow-radius: ${(props) => props.selected ? 8 : 4}px;
  elevation: ${(props) => props.selected ? 4 : 2};
  min-height: 44px;
  justify-content: center;
  align-items: center;
`;

const RecentSearchItem = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: ${(props) => props.theme.spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.divider};
`;

const SuggestionItem = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: ${(props) => props.theme.spacing.md}px;
  background-color: ${(props) => props.theme.cardBackground};
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.divider};
`;

// Search filter types
interface SearchFilters {
  categories: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortBy: 'relevance' | 'date' | 'popularity';
}

// Constants
const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

const DEFAULT_FILTERS: SearchFilters = {
  categories: [],
  dateRange: 'all',
  sortBy: 'relevance',
};

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Most Relevant' },
  { key: 'date', label: 'Most Recent' },
  { key: 'popularity', label: 'Most Popular' },
];

const DATE_RANGE_OPTIONS = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
];

const SearchScreen = () => {
  // State management
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Store and navigation
  const user = useAppStore((state) => state.user);
  const role = user?.role || 'guest';
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useTheme();

  // Load recent searches and categories on mount
  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
      loadCategories();
    }, [])
  );

  // Load recent searches from storage
  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Load categories for filters
  const loadCategories = async () => {
    try {
      const results = await fetchNews(role, '', '');
      const uniqueCategories = [...new Set(results.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Save search to recent searches
  const saveRecentSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)]
        .slice(0, MAX_RECENT_SEARCHES);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  // Search function with filters
  const searchNews = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let results = await fetchNews(role, '', searchQuery);

      // Apply category filters
      if (searchFilters.categories.length > 0) {
        results = results.filter(item => searchFilters.categories.includes(item.category));
      }

      // Apply date range filter
      if (searchFilters.dateRange !== 'all') {
        const now = new Date();
        const filterDate = new Date();

        switch (searchFilters.dateRange) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }

        results = results.filter(item => new Date(item.createdAt) >= filterDate);
      }

      // Apply sorting
      switch (searchFilters.sortBy) {
        case 'date':
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popularity':
          results.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
          break;
        // 'relevance' is default from API
      }

      setSearchResults(results);
      await saveRecentSearch(searchQuery);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Debounced search effect
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (query.trim()) {
        searchNews(query, filters);
      } else {
        setSearchResults([]);
        setError(null);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query, filters, searchNews]);

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setQuery(text);

    // Show suggestions for non-empty queries
    if (text.trim()) {
      const filtered = recentSearches.filter(search =>
        search.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    setError(null);
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  // Render news item using modern NewsCard
  const renderNewsItem = ({ item, index }: { item: News; index: number }) => (
    <NewsCard
      news={item}
      index={index}
      variant="compact"
    />
  );
  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <FilterModalContainer>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setShowFilters(false)}
        />
        <FilterModalContent>
          {/* Modern Modal Handle */}
          <View style={{
            width: 40,
            height: 4,
            backgroundColor: theme.text.tertiary,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: theme.spacing.lg,
          }} />

          <Row justify="space-between" align="center" style={{ marginBottom: theme.spacing.xl }}>
            <View>
              <Typography variant="h3" weight="bold" color="primary">
                Filter Results
              </Typography>
              <Typography variant="body2" color="secondary" style={{ marginTop: 4 }}>
                Refine your search with these options
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.surface,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="close" size={20} color={theme.text.primary} />
            </TouchableOpacity>
          </Row>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Categories Filter */}
            <FilterSection>
              <Row align="center" style={{ marginBottom: theme.spacing.lg }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.md,
                }}>
                  <Icon name="grid-outline" size={16} color={theme.primary} />
                </View>
                <View>
                  <Typography variant="h4" weight="bold" color="primary">
                    Categories
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Select topics you're interested in
                  </Typography>
                </View>
              </Row>
              <Row style={{ flexWrap: 'wrap' }}>
                {categories.map((category) => (
                  <FilterChip
                    key={category}
                    selected={filters.categories.includes(category)}
                    onPress={() => {
                      const updated = filters.categories.includes(category)
                        ? filters.categories.filter(c => c !== category)
                        : [...filters.categories, category];
                      setFilters({ ...filters, categories: updated });
                    }}
                  >
                    <Typography
                      variant="body2"
                      color={filters.categories.includes(category) ? 'inverse' : 'primary'}
                      weight="medium"
                    >
                      {category}
                    </Typography>
                  </FilterChip>
                ))}
              </Row>
            </FilterSection>

            {/* Date Range Filter */}
            <FilterSection>
              <Row align="center" style={{ marginBottom: theme.spacing.lg }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.accent + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.md,
                }}>
                  <Icon name="calendar-outline" size={16} color={theme.accent} />
                </View>
                <View>
                  <Typography variant="h4" weight="bold" color="primary">
                    Date Range
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Filter by publication date
                  </Typography>
                </View>
              </Row>
              <Row style={{ flexWrap: 'wrap' }}>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.key}
                    selected={filters.dateRange === option.key}
                    onPress={() => setFilters({ ...filters, dateRange: option.key as any })}
                  >
                    <Typography
                      variant="body2"
                      color={filters.dateRange === option.key ? 'inverse' : 'primary'}
                      weight="medium"
                    >
                      {option.label}
                    </Typography>
                  </FilterChip>
                ))}
              </Row>
            </FilterSection>

            {/* Sort By Filter */}
            <FilterSection>
              <Row align="center" style={{ marginBottom: theme.spacing.lg }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.success + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.md,
                }}>
                  <Icon name="swap-vertical-outline" size={16} color={theme.success} />
                </View>
                <View>
                  <Typography variant="h4" weight="bold" color="primary">
                    Sort By
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Order results by preference
                  </Typography>
                </View>
              </Row>
              <Row style={{ flexWrap: 'wrap' }}>
                {SORT_OPTIONS.map((option) => (
                  <FilterChip
                    key={option.key}
                    selected={filters.sortBy === option.key}
                    onPress={() => setFilters({ ...filters, sortBy: option.key as any })}
                  >
                    <Typography
                      variant="body2"
                      color={filters.sortBy === option.key ? 'inverse' : 'primary'}
                      weight="medium"
                    >
                      {option.label}
                    </Typography>
                  </FilterChip>
                ))}
              </Row>
            </FilterSection>
          </ScrollView>

          <Row style={{
            marginTop: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.divider,
          }}>
            <Button
              title="Clear All"
              variant="outline"
              onPress={() => setFilters(DEFAULT_FILTERS)}
              style={{
                flex: 1,
                marginRight: theme.spacing.sm,
                height: 48,
                borderRadius: 12,
              }}
            />
            <Button
              title="Apply Filters"
              variant="primary"
              onPress={() => setShowFilters(false)}
              style={{
                flex: 1,
                marginLeft: theme.spacing.sm,
                height: 48,
                borderRadius: 12,
              }}
            />
          </Row>
        </FilterModalContent>
      </FilterModalContainer>
    </Modal>
  );

  // Main render
  return (
    <Screen edges={['top', 'bottom']}>
      <Header
        title="Search News"
        showBackButton
        onBackPress={() => navigation.goBack()}
        gradient={true}
      />

      <Column flex={1}>
        {/* Search Input Section */}
        <SearchContainer>
          <SearchInputContainer>
            <Icon name="search" size={20} color={theme.text.secondary} />
            <SearchInput
              placeholder="Search news..."
              placeholderTextColor={theme.text.tertiary}
              value={query}
              onChangeText={handleSearchChange}
              autoFocus={true}
              onFocus={() => setShowSuggestions(recentSearches.length > 0 && !query)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Icon name="close-circle" size={20} color={theme.text.secondary} />
              </TouchableOpacity>
            )}
          </SearchInputContainer>

          {/* Filter Button */}
          <Row>
            <FilterButton
              active={Object.values(filters).some(f =>
                Array.isArray(f) ? f.length > 0 : f !== DEFAULT_FILTERS[f as keyof SearchFilters]
              )}
              onPress={() => setShowFilters(true)}
            >
              <Icon
                name="options"
                size={16}
                color={theme.text.primary}
                style={{ marginRight: theme.spacing.xs }}
              />
              <Typography variant="body2" weight="medium">
                Filters
              </Typography>
            </FilterButton>
          </Row>
        </SearchContainer>

        {/* Suggestions */}
        {showSuggestions && (
          <Card variant="outlined" style={{ margin: theme.spacing.md, marginTop: 0 }}>
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                onPress={() => selectSuggestion(suggestion)}
              >
                <Icon name="time-outline" size={16} color={theme.text.tertiary} />
                <Typography
                  variant="body2"
                  style={{ marginLeft: theme.spacing.sm }}
                >
                  {suggestion}
                </Typography>
              </SuggestionItem>
            ))}
            {recentSearches.length > 0 && (
              <TouchableOpacity
                onPress={clearRecentSearches}
                style={{
                  padding: theme.spacing.md,
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: theme.divider,
                }}
              >
                <Typography variant="body2" color="secondary">
                  Clear Recent Searches
                </Typography>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Results */}
        {loading ? (
          <Container flex={1} justify="center" align="center">
            <LoadingSpinner size="large" />
            <Typography
              variant="body1"
              color="secondary"
              style={{ marginTop: theme.spacing.md }}
            >
              Searching...
            </Typography>
          </Container>
        ) : error ? (
          <Container flex={1} justify="center" align="center" paddingHorizontal="lg">
            <Icon name="alert-circle-outline" size={64} color={theme.error} />
            <Typography
              variant="h4"
              color="primary"
              align="center"
              style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}
            >
              Search Error
            </Typography>
            <Typography
              variant="body2"
              color="secondary"
              align="center"
              style={{ marginBottom: theme.spacing.lg }}
            >
              {error}
            </Typography>
            <Button
              title="Try Again"
              onPress={() => searchNews(query, filters)}
              variant="primary"
            />
          </Container>
        ) : searchResults.length > 0 ? (
          <OptimizedFlatList
            data={searchResults}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item._id}
            contentPadding={false}
            estimatedItemSize={100}
          />
        ) : (
          <Container flex={1} justify="center" align="center" paddingHorizontal="lg">
            <Icon name="search-outline" size={64} color={theme.text.tertiary} />
            <Typography
              variant="h4"
              color="secondary"
              align="center"
              style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}
            >
              {query.trim() ? 'No Results Found' : 'Start Searching'}
            </Typography>
            <Typography
              variant="body2"
              color="tertiary"
              align="center"
            >
              {query.trim()
                ? 'Try adjusting your search terms or filters.'
                : 'Enter a search term to find news articles.'
              }
            </Typography>
          </Container>
        )}
      </Column>

      {renderFilterModal()}
    </Screen>
  );
};

export default SearchScreen;