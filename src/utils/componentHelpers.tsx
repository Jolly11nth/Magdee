import React from 'react';

/**
 * Helper function to ensure all React components have proper displayName properties
 * This helps with debugging and prevents displayName-related errors
 */

// Type guard to check if a component has a displayName
type ComponentWithDisplayName = React.ComponentType<any> & {
  displayName?: string;
};

/**
 * Utility to ensure a component has a displayName
 * @param component - The React component
 * @param name - The display name to assign
 * @returns The component with displayName
 */
export function withDisplayName<T extends ComponentWithDisplayName>(
  component: T,
  name: string
): T {
  if (!component.displayName) {
    component.displayName = name;
  }
  return component;
}

/**
 * HOC that ensures any wrapped component has a displayName
 * @param WrappedComponent - Component to wrap
 * @param displayName - Name to assign
 */
export function ensureDisplayName<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName: string
) {
  const ComponentWithDisplayName = React.forwardRef<any, P>((props, ref) => {
    return <WrappedComponent {...props} ref={ref} />;
  });
  
  ComponentWithDisplayName.displayName = displayName;
  return ComponentWithDisplayName;
}

/**
 * Creates a safe component wrapper that handles errors gracefully
 * and ensures proper displayName
 */
export function createSafeComponent<P extends object>(
  Component: React.ComponentType<P>,
  displayName: string,
  fallback?: React.ComponentType<any>
) {
  const SafeComponent = React.forwardRef<any, P>((props, ref) => {
    try {
      return <Component {...props} ref={ref} />;
    } catch (error) {
      console.error(`Error in component ${displayName}:`, error);
      
      if (fallback) {
        return React.createElement(fallback, props);
      }
      
      // Default fallback
      return (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.5rem',
          color: '#DC2626',
          fontSize: '0.875rem',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Error loading {displayName}
        </div>
      );
    }
  });
  
  SafeComponent.displayName = `Safe(${displayName})`;
  return SafeComponent;
}

/**
 * Debug component that shows component information in development
 */
export function DebugComponent({ 
  componentName, 
  props = {}, 
  children 
}: {
  componentName: string;
  props?: Record<string, any>;
  children?: React.ReactNode;
}) {
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isDevelopment) {
    return <>{children}</>;
  }
  
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        color: 'white',
        fontSize: '0.625rem',
        padding: '0.125rem 0.25rem',
        borderRadius: '0 0 0 0.25rem',
        fontFamily: 'monospace',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.7
      }}>
        {componentName}
      </div>
    </div>
  );
}

DebugComponent.displayName = 'DebugComponent';

/**
 * Utility to wrap lazy-loaded components with proper error handling
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ [key: string]: React.ComponentType<P> }>,
  exportName: string,
  displayName: string
) {
  const LazyComponent = React.lazy(() => 
    importFn().then(module => {
      const Component = module[exportName];
      if (!Component) {
        throw new Error(`Export '${exportName}' not found in module`);
      }
      
      // Ensure the component has a displayName
      if (!Component.displayName) {
        (Component as any).displayName = displayName;
      }
      
      return { default: Component };
    }).catch(error => {
      console.error(`Failed to load component ${displayName}:`, error);
      
      // Return a fallback component
      const FallbackComponent: React.ComponentType<P> = (props) => (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.5rem',
          margin: '1rem'
        }}>
          <h3 style={{ color: '#DC2626', marginBottom: '0.5rem' }}>
            Failed to load {displayName}
          </h3>
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem' }}>
            {error.message || 'Unknown error occurred'}
          </p>
        </div>
      );
      
      FallbackComponent.displayName = `Fallback(${displayName})`;
      return { default: FallbackComponent };
    })
  );
  
  LazyComponent.displayName = `Lazy(${displayName})`;
  return LazyComponent;
}

/**
 * Validation utility to check if all components in a module have displayNames
 */
export function validateComponentDisplayNames(
  components: Record<string, React.ComponentType<any>>,
  moduleName: string
) {
  const missingDisplayNames: string[] = [];
  
  Object.entries(components).forEach(([name, component]) => {
    if (!component.displayName) {
      missingDisplayNames.push(name);
      // Auto-assign if missing
      component.displayName = name;
    }
  });
  
  if (missingDisplayNames.length > 0) {
    console.warn(
      `Components in ${moduleName} missing displayName:`,
      missingDisplayNames
    );
  }
  
  return components;
}

/**
 * Performance wrapper that adds performance monitoring to components
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const PerformanceMonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const renderStart = React.useRef<number>();
    
    React.useLayoutEffect(() => {
      renderStart.current = performance.now();
    });
    
    React.useEffect(() => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        if (renderTime > 100) { // Only log slow renders
          console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    });
    
    return <Component {...props} ref={ref} />;
  });
  
  PerformanceMonitoredComponent.displayName = `Monitored(${componentName})`;
  return PerformanceMonitoredComponent;
}