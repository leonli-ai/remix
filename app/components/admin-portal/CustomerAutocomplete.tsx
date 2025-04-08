import { Autocomplete, BlockStack, Grid, InlineError, Text } from '@shopify/polaris';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomers } from '~/hooks/use-customers';
import { useRoleAssignmentsSearch } from '~/hooks/use-quotes';

interface SelectedCustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  locationName?: string;
  companyId?: string;
  locationId?: string;
  contactId?: string;
}

interface CustomerAutocompleteProps {
  onSelect?: (data: {
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    } | null;
    location: {
      companyId: string;
      companyName: string;
      locationId: string;
      locationName: string;
    } | null;
  }) => void;
  customerError?: string;
  locationError?: string;
  initialSelectedInfo?: {
    customer: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    } | null;
    location: {
      companyId: string;
      companyName: string;
      locationId: string;
      locationName: string;
    } | null;
  } | null;
}

export function CustomerAutocomplete({ onSelect, customerError, locationError, initialSelectedInfo }: CustomerAutocompleteProps) {
  const { t } = useTranslation();

  // Customer states
  const [customerOptions, setCustomerOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string[]>([]);
  const [customerInputValue, setCustomerInputValue] = useState('');

  // Location states
  const [locationOptions, setLocationOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [locationInputValue, setLocationInputValue] = useState('');
  const [locationSelected, setLocationSelected] = useState(false);

  // Selected customer information
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState<SelectedCustomerInfo | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks for fetching data
  const { customers, isLoading: customersLoading, fetchCustomers, pagination: customersPagination } = useCustomers();

  const { roleAssignments, isLoading: locationsLoading, fetchRoleAssignments, pagination: locationsPagination } = useRoleAssignmentsSearch();

  // Initialize with initial values if provided
  useEffect(() => {
    if (initialSelectedInfo && initialSelectedInfo.customer && initialSelectedInfo.customer.id) {
      // Set customer info - use a more robust display name
      const customerName =
        [initialSelectedInfo.customer.firstName, initialSelectedInfo.customer.lastName].filter(Boolean).join(' ') ||
        initialSelectedInfo.customer.email ||
        initialSelectedInfo.customer.id;

      setSelectedCustomer([initialSelectedInfo.customer.id]);
      setCustomerInputValue(customerName);

      const contactId = customers.find(customer => customer.id === initialSelectedInfo?.customer?.id)?.companyContactProfiles?.[0]?.id || '';

      // Set selected customer info
      setSelectedCustomerInfo({
        id: initialSelectedInfo.customer.id,
        firstName: initialSelectedInfo.customer.firstName || '',
        lastName: initialSelectedInfo.customer.lastName || '',
        email: initialSelectedInfo.customer.email || '',
        phone: initialSelectedInfo.customer.phone || '',
        companyName: initialSelectedInfo.location?.companyName || '',
        locationName: initialSelectedInfo.location?.locationName || '',
        contactId,
      });

      setShowLocationSelector(true);

      // If location is also provided
      if (initialSelectedInfo.location && initialSelectedInfo.location.locationId) {
        const locationValue = `${initialSelectedInfo.location.companyId || ''}_${initialSelectedInfo.location.locationId}`;
        setSelectedLocation([locationValue]);

        const locationDisplayName = `${initialSelectedInfo.location.companyName || ''} - ${initialSelectedInfo.location.locationName || ''}`;
        setLocationInputValue(locationDisplayName);
        setLocationSelected(true);

        // Update selected customer info with location details
        setSelectedCustomerInfo((prev) => ({
          ...prev!,
          companyName: initialSelectedInfo.location!.companyName || '',
          locationName: initialSelectedInfo.location!.locationName || '',
          companyId: initialSelectedInfo.location!.companyId || '',
          locationId: initialSelectedInfo.location!.locationId || '',
        }));

        // Load company locations for this customer
        fetchRoleAssignments({
          contactId,
          first: 14,
          searchQuery: '',
        });
      }
    }
  }, [initialSelectedInfo]);

  // Load initial customers
  useEffect(() => {
    fetchCustomers({
      pagination: { first: 14 },
    });
  }, [fetchCustomers]);

  // Update customer options when customers data changes
  useEffect(() => {
    if (customers && customers.length > 0) {
      const filteredCustomers = customers.filter((customer) => {
        return customer.companyContactProfiles && Array.isArray(customer.companyContactProfiles) && customer.companyContactProfiles.length > 0;
      });

      const options = filteredCustomers.map((customer) => ({
        value: customer.id,
        label: customer.displayName || '',
      }));

      setCustomerOptions((prevOptions) => {
        // If this is a search query, replace existing options
        if (searchQuery) {
          return options;
        }
        
        // For pagination (not search), append new options
        if (customersPagination.endCursor && prevOptions.length > 0) {
          // Filter out duplicates
          const existingIds = new Set(prevOptions.map((opt) => opt.value));
          const newOptions = options.filter((opt) => !existingIds.has(opt.value));
          return [...prevOptions, ...newOptions];
        }
        
        return options;
      });
    }
  }, [customers, customersPagination.endCursor, customersPagination.hasNextPage, searchQuery]);

  // Update location options when roleAssignments data changes
  useEffect(() => {
    if (roleAssignments && roleAssignments.length > 0 && showLocationSelector) {
      const options = roleAssignments.map((location) => ({
        value: `${location.company?.id || ''}_${location.companyLocation?.id || ''}`,
        label: `${location.company?.name || ''} - ${location.companyLocation?.name || ''}`,
      }));

      setLocationOptions((prevOptions) => {
        // If we're loading more, append to existing options
        if (locationsPagination.endCursor && prevOptions.length > 0) {
          // Filter out duplicates
          const existingIds = new Set(prevOptions.map((opt) => opt.value));
          const newOptions = options.filter((opt) => !existingIds.has(opt.value));
          return [...prevOptions, ...newOptions];
        }
        // Otherwise replace options
        return options;
      });
    }
  }, [roleAssignments, showLocationSelector, locationsPagination.endCursor]);

  // Handle customer input changes
  const handleCustomerInputChange = useCallback(
    (value: string) => {
      setCustomerInputValue(value);

      if (value === '') {
        // Reset customer search
        setCustomerOptions([]);
        fetchCustomers({
          pagination: { first: 14 },
        });
        return;
      }

      // Debounce search
      const timeoutId = setTimeout(() => {
        setSearchQuery(value);
        fetchCustomers({
          searchQuery: value,
          pagination: { first: 14 },
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [fetchCustomers],
  );

  // Handle location input changes
  const handleLocationInputChange = useCallback(
    (value: string) => {
      setLocationInputValue(value);

      if (selectedCustomerInfo?.contactId) {
        // Reset location options when search changes
        if (value === '') {
          setLocationOptions([]);
        }

        // Debounce search
        const timeoutId = setTimeout(() => {
          fetchRoleAssignments({
            contactId: selectedCustomerInfo.contactId || '',
            first: 14,
            searchQuery: value,
          });
        }, 300);

        return () => clearTimeout(timeoutId);
      }
    },
    [fetchRoleAssignments, selectedCustomerInfo],
  );

  // Handle customer selection
  const handleCustomerSelect = useCallback(
    (selected: string[]) => {
      setSelectedCustomer(selected);

      if (selected.length > 0) {
        const customerId = selected[0];
        // First try to find the customer in the current customers array
        let customer = customers.find((c) => c.id === customerId);
        
        // If not found in customers but exists in customerOptions, create a placeholder
        if (!customer) {
          const selectedOption = customerOptions.find(opt => opt.value === customerId);
          if (selectedOption) {
            // Keep the selection and display name even if full customer data isn't available
            setCustomerInputValue(selectedOption.label || '');
            
            // Fetch the specific customer data if needed
            fetchCustomers({
              searchQuery: customerId,
              pagination: { first: 1 }
            });
            
            return;
          }
        }

        if (customer) {
          setCustomerInputValue(customer.displayName || '');

          setSelectedLocation([]);
          setLocationSelected(false);
          setLocationOptions([]);
          setLocationInputValue('');

          const customerInfo = {
            id: customerId,
            firstName: customer.firstName || '',
            lastName: customer.lastName || '',
            email: customer.email || '',
            phone: customer.phone || '',
            companyName: '',
            locationName: '',
          };

          setSelectedCustomerInfo(customerInfo);

          // Call onSelect with updated customer info
          onSelect?.({
            customer: {
              id: customerId,
              firstName: customer.firstName || '',
              lastName: customer.lastName || '',
              email: customer.email || '',
              phone: customer.phone || '',
            },
            location: null,
          });

          // If customer has company contact profiles, load locations
          if (customer.companyContactProfiles && customer.companyContactProfiles.length > 0) {
            const contactId = customer.companyContactProfiles[0]?.id;
            if (contactId) {
              setShowLocationSelector(true);
              setSelectedCustomerInfo((prev) => ({
                ...prev!,
                contactId,
              }));

              fetchRoleAssignments({
                contactId,
                first: 14,
                searchQuery: '',
              });
            } else {
              setShowLocationSelector(false);
            }
          } else {
            setShowLocationSelector(false);
          }
        }
      } else {
        setSelectedCustomerInfo(null);
        setShowLocationSelector(false);

        // Call onSelect with null values when customer is deselected
        onSelect?.({
          customer: null,
          location: null,
        });
      }
    },
    [customers, customerOptions, onSelect],
  );

  // Handle location selection
  const handleLocationSelect = useCallback(
    (selected: string[]) => {
      console.log('selected location:', selected);
      
      // Always update the selection state
      setSelectedLocation(selected);
      setLocationSelected(selected.length > 0);
      
      const customerData = selectedCustomerInfo ? {
        id: selectedCustomerInfo.id,
        firstName: selectedCustomerInfo.firstName,
        lastName: selectedCustomerInfo.lastName,
        email: selectedCustomerInfo.email,
        phone: selectedCustomerInfo.phone,
      } : null;

      if (selected.length > 0) {
        const locationValue = selected[0];
        const [companyId, locationId] = locationValue.split('_');
        
        // Find the location in roleAssignments
        const location = roleAssignments.find(
          (l) => l.company?.id === companyId && l.companyLocation?.id === locationId
        );

        if (location && selectedCustomerInfo) {
          // Set the display value
          const locationDisplayName = `${location.company?.name || ''} - ${location.companyLocation?.name || ''}`;
          setLocationInputValue(locationDisplayName);
          
          // Force update selectedCustomerInfo with location details
          const updatedCustomerInfo = {
            ...selectedCustomerInfo,
            companyName: location.company?.name || '',
            locationName: location.companyLocation?.name || '',
            companyId: location.company?.id || '',
            locationId: location.companyLocation?.id || '',
          };

          console.log('updatedCustomerInfo', updatedCustomerInfo);
          
          setSelectedCustomerInfo(updatedCustomerInfo);
          
          // Call the parent component's onSelect with updated info
          onSelect?.({
            customer: customerData,
            location: {
              companyId: location.company?.id || '',
              companyName: location.company?.name || '',
              locationId: location.companyLocation?.id || '',
              locationName: location.companyLocation?.name || '',
            },
          });
        }
      } else {
        // Clear location selection
        setLocationInputValue('');
        
        if (selectedCustomerInfo) {
          setSelectedCustomerInfo({
            ...selectedCustomerInfo,
            companyName: '',
            locationName: '',
            companyId: '',
            locationId: '',
          });

          onSelect?.({
            customer: customerData,
            location: null,
          });
        }
      }
    },
    [roleAssignments, selectedCustomerInfo, onSelect],
  );

  // Load more customers - simplified logic
  const loadMoreCustomers = useCallback(() => {
    fetchCustomers({
      searchQuery,
      pagination: {
        first: 14,
        after: customersPagination.endCursor,
      },
    });
  }, [customersPagination, fetchCustomers, searchQuery]);

  // Load more locations - simplified logic
  const loadMoreLocations = useCallback(() => {
    if (locationsPagination.hasNextPage && locationsPagination.endCursor && selectedCustomerInfo?.contactId) {
      fetchRoleAssignments({
        contactId: selectedCustomerInfo.contactId,
        first: 14,
        after: locationsPagination.endCursor,
        searchQuery: locationInputValue,
      });
    }
  }, [locationsPagination, fetchRoleAssignments, selectedCustomerInfo, locationInputValue]);

  // Render customer info card
  const renderCustomerInfoCard = () => {
    if (!selectedCustomerInfo || !locationSelected) return null;

    return (
      <Grid columns={{ xs: 1, sm: 3, md: 5, lg: 5, xl: 5 }}>
        <Grid.Cell>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="h4"
          >
            {t('admin-portal.quoteCreate.customer.first-name')}
          </Text>
          <Text
            variant="bodyLg"
            as="span"
          >
            {selectedCustomerInfo.firstName}
          </Text>
        </Grid.Cell>
        <Grid.Cell>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="h4"
          >
            {t('admin-portal.quoteCreate.customer.last-name')}
          </Text>
          <Text
            variant="bodyLg"
            as="span"
          >
            {selectedCustomerInfo.lastName}
          </Text>
        </Grid.Cell>
        <Grid.Cell>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="h4"
          >
            {t('admin-portal.quoteCreate.customer.email-address')}
          </Text>
          <Text
            variant="bodyLg"
            as="span"
            breakWord
          >
            {selectedCustomerInfo.email}
          </Text>
        </Grid.Cell>
        <Grid.Cell>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="h4"
          >
            {t('admin-portal.quoteCreate.customer.phone-number')}
          </Text>
          <Text
            variant="bodyLg"
            as="span"
          >
            {selectedCustomerInfo.phone}
          </Text>
        </Grid.Cell>
        <Grid.Cell>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="h4"
          >
            {t('admin-portal.quoteCreate.customer.company-name')}
          </Text>
          <Text
            variant="bodyLg"
            as="span"
          >
            {selectedCustomerInfo.companyName}
          </Text>
        </Grid.Cell>
        <Grid.Cell>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="h4"
          >
            {t('admin-portal.quoteCreate.customer.company-account')}
          </Text>
          <Text
            variant="bodyLg"
            as="span"
          >
            {selectedCustomerInfo.locationName}
          </Text>
        </Grid.Cell>
      </Grid>
    );
  };

  // Customer autocomplete markup
  const customerTextField = (
    <>
      <Autocomplete.TextField
        onChange={handleCustomerInputChange}
        label={t('admin-portal.quoteCreate.customer.label')}
        value={customerInputValue}
        placeholder={t('admin-portal.quoteCreate.customer.placeholder')}
        autoComplete="off"
        error={Boolean(customerError)}
      />
      <div className="mt-2">
        {customerError && (
          <InlineError
            message={customerError}
            fieldID="customerAutocomplete"
          />
        )}
      </div>
    </>
  );

  // Location autocomplete markup (only shown after customer selection)
  const locationTextField = (
    <>
      <Autocomplete.TextField
        onChange={handleLocationInputChange}
        label={t('admin-portal.quoteCreate.customer.location-label')}
        value={locationInputValue}
        placeholder={t('admin-portal.quoteCreate.customer.location-placeholder')}
        autoComplete="off"
        error={Boolean(locationError)}
      />
      <div className="mt-2">
        {locationError && (
          <InlineError
            message={locationError}
            fieldID="locationAutocomplete"
          />
        )}
      </div>
    </>
  );

  return (
    <BlockStack gap="400">
      <Autocomplete
        options={customerOptions}
        selected={selectedCustomer}
        onSelect={handleCustomerSelect}
        textField={customerTextField}
        loading={customersLoading}
        willLoadMoreResults={customersPagination.hasNextPage}
        onLoadMoreResults={loadMoreCustomers}
      />

      {showLocationSelector && (
        <Autocomplete
          options={locationOptions}
          selected={selectedLocation}
          onSelect={handleLocationSelect}
          textField={locationTextField}
          loading={locationsLoading}
          willLoadMoreResults={locationsPagination.hasNextPage}
          onLoadMoreResults={loadMoreLocations}
        />
      )}

      {renderCustomerInfoCard()}
    </BlockStack>
  );
}
