import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FiShare2, FiLoader, FiInfo } from 'react-icons/fi';
import { analyzeDataSharing } from '../../services/geminiService';

// Custom node component for better styling
const CustomNode = ({ data }) => {
  const getNodeStyle = (type) => {
    switch (type) {
      case 'source':
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-200';
      case 'primary':
        return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-200';
      case 'third-party':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-200';
      case 'government':
        return 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-200';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200';
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${getNodeStyle(data.type)}`}>
      <div className="font-bold text-sm">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 opacity-75">{data.description}</div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

function DataSharingMap({ originalText }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [error, setError] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const analyzeDataSharingPractices = async () => {
    console.log('Re-analyze button clicked!'); // Debug log
    setIsAnalyzing(true);
    setError(null);
    setAnalysisComplete(false);

    try {
      console.log('Starting data sharing analysis...');

      // Use original text if available, otherwise use sample text for demonstration
      const textToAnalyze = originalText || "Sample Terms of Service: We collect personal information when you create an account. We may share your data with analytics partners for service improvement. We may disclose information to advertising partners for targeted marketing. We may provide data to legal authorities when required by law.";

      console.log('Analyzing text:', textToAnalyze.substring(0, 100) + '...');
      const analysis = await analyzeDataSharing(textToAnalyze);
      console.log('Data sharing analysis result:', analysis);

      if (analysis && analysis.nodes && analysis.edges) {
        console.log('Analysis received:', analysis);
        console.log('Nodes:', analysis.nodes);
        console.log('Edges:', analysis.edges);

        // Convert nodes to ReactFlow format
        const flowNodes = analysis.nodes.map((node, index) => ({
          id: node.id,
          type: 'custom',
          position: getNodePosition(index, analysis.nodes.length, analysis.nodes),
          data: {
            label: node.label,
            type: node.type,
            description: node.description
          },
        }));

        console.log('Flow nodes created:', flowNodes);

        // Convert edges to ReactFlow format
        const flowEdges = analysis.edges.map((edge, index) => ({
          id: `edge-${index}`,
          source: edge.from,
          target: edge.to,
          label: edge.label,
          data: {
            clause: edge.clause,
            description: edge.description
          },
          style: {
            stroke: getEdgeColor(edge.label),
            strokeWidth: 3,
            strokeDasharray: '5,5',
          },
          markerEnd: {
            type: 'arrowclosed',
            color: getEdgeColor(edge.label),
            width: 20,
            height: 20,
          },
          labelStyle: {
            fill: getEdgeColor(edge.label),
            fontWeight: 600,
            fontSize: 12,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.9,
          },
        }));

        console.log('Flow edges created:', flowEdges);

        setNodes(flowNodes);
        setEdges(flowEdges);
        setAnalysisComplete(true);

        console.log('State updated - nodes:', flowNodes.length, 'edges:', flowEdges.length);
      } else {
        console.error('Invalid analysis response format:', analysis);
        setError('Invalid analysis response format');
      }
    } catch (error) {
      console.error('Error analyzing data sharing:', error);
      console.log('Error details:', error);
      setError(`Analysis failed: ${error.message}. Showing demo data instead.`);

      // Show mock data as fallback
      console.log('Showing mock data as fallback...');
      const mockData = {
        nodes: [
          {id: "user", label: "User Data", type: "source", description: "Personal information provided by users"},
          {id: "company", label: "Service Provider", type: "primary", description: "Primary data controller and processor"},
          {id: "analytics", label: "Analytics Partners", type: "third-party", description: "Third-party analytics and measurement services"},
          {id: "advertisers", label: "Advertising Partners", type: "third-party", description: "Advertising networks and partners"},
          {id: "legal", label: "Legal Authorities", type: "government", description: "Government agencies and legal authorities"}
        ],
        edges: [
          {from: "user", to: "company", label: "Personal Data", clause: "Mock: Users provide personal information when creating accounts", description: "Account creation and service usage"},
          {from: "company", to: "analytics", label: "Usage Analytics", clause: "Mock: We may share aggregated usage data with analytics providers", description: "Service improvement and analytics"},
          {from: "company", to: "advertisers", label: "Advertising Data", clause: "Mock: We may share data with advertising partners for targeted ads", description: "Personalized advertising"},
          {from: "company", to: "legal", label: "Legal Compliance", clause: "Mock: We may disclose information when required by law", description: "Legal obligations and compliance"}
        ]
      };

      // Convert mock data to ReactFlow format
      const flowNodes = mockData.nodes.map((node, index) => ({
        id: node.id,
        type: 'custom',
        position: getNodePosition(index, mockData.nodes.length, mockData.nodes),
        data: {
          label: node.label,
          type: node.type,
          description: node.description
        },
      }));

      const flowEdges = mockData.edges.map((edge, index) => ({
        id: `edge-${index}`,
        source: edge.from,
        target: edge.to,
        label: edge.label,
        type: 'smoothstep',
        animated: true,
        data: {
          clause: edge.clause,
          description: edge.description
        },
        style: {
          stroke: getEdgeColor(edge.label),
          strokeWidth: 3,
          strokeDasharray: '5,5',
        },
        markerEnd: {
          type: 'arrowclosed',
          color: getEdgeColor(edge.label),
          width: 20,
          height: 20,
        },
        labelStyle: {
          fill: getEdgeColor(edge.label),
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.9,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setAnalysisComplete(true);
      setError(null); // Clear error since we're showing mock data
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to position nodes for clear data flow visualization
  const getNodePosition = (index, total, nodes) => {
    const node = nodes[index];

    // Position nodes in a logical flow pattern: User → Company → Third Parties
    if (node.type === 'source') {
      return { x: 50, y: 200 }; // User data on the far left
    } else if (node.type === 'primary') {
      return { x: 350, y: 200 }; // Company in the center
    } else if (node.type === 'third-party') {
      // Third parties on the right, stacked vertically
      const thirdPartyNodes = nodes.filter(n => n.type === 'third-party');
      const thirdPartyIndex = thirdPartyNodes.findIndex(n => n.id === node.id);
      return { x: 650, y: 100 + (thirdPartyIndex * 100) };
    } else if (node.type === 'government') {
      return { x: 650, y: 350 }; // Government at bottom right
    }

    // Fallback to circular layout for any other types
    const radius = 200;
    const angle = (index * 2 * Math.PI) / total;
    return {
      x: 350 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
    };
  };

  // Helper function to get edge colors based on data type
  const getEdgeColor = (label) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('personal') || lowerLabel.includes('private') || lowerLabel.includes('identity')) return '#ef4444'; // red - sensitive
    if (lowerLabel.includes('analytics') || lowerLabel.includes('usage') || lowerLabel.includes('performance')) return '#f59e0b'; // amber - analytics
    if (lowerLabel.includes('marketing') || lowerLabel.includes('advertising') || lowerLabel.includes('ads')) return '#8b5cf6'; // purple - marketing
    if (lowerLabel.includes('legal') || lowerLabel.includes('compliance') || lowerLabel.includes('law')) return '#dc2626'; // dark red - legal
    if (lowerLabel.includes('cookies') || lowerLabel.includes('tracking')) return '#059669'; // green - tracking
    return '#6b7280'; // gray - default
  };

  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
  };

  // Auto-load demo data when component mounts
  useEffect(() => {
    console.log('Component mounted, loading demo data...');

    // Load mock data immediately
    const mockData = {
      nodes: [
        {id: "user", label: "User Data", type: "source", description: "Personal information provided by users"},
        {id: "company", label: "Service Provider", type: "primary", description: "Primary data controller and processor"},
        {id: "analytics", label: "Analytics Partners", type: "third-party", description: "Third-party analytics and measurement services"},
        {id: "advertisers", label: "Advertising Partners", type: "third-party", description: "Advertising networks and partners"},
        {id: "legal", label: "Legal Authorities", type: "government", description: "Government agencies and legal authorities"}
      ],
      edges: [
        {from: "user", to: "company", label: "Personal Data", clause: "Demo: Users provide personal information when creating accounts", description: "Account creation and service usage"},
        {from: "company", to: "analytics", label: "Usage Analytics", clause: "Demo: We may share aggregated usage data with analytics providers", description: "Service improvement and analytics"},
        {from: "company", to: "advertisers", label: "Advertising Data", clause: "Demo: We may share data with advertising partners for targeted ads", description: "Personalized advertising"},
        {from: "company", to: "legal", label: "Legal Compliance", clause: "Demo: We may disclose information when required by law", description: "Legal obligations and compliance"}
      ]
    };

    // Convert mock data to ReactFlow format
    const flowNodes = mockData.nodes.map((node, index) => ({
      id: node.id,
      type: 'custom',
      position: getNodePosition(index, mockData.nodes.length, mockData.nodes),
      data: {
        label: node.label,
        type: node.type,
        description: node.description
      },
    }));

    const flowEdges = mockData.edges.map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      type: 'smoothstep',
      animated: true,
      data: {
        clause: edge.clause,
        description: edge.description
      },
      style: {
        stroke: getEdgeColor(edge.label),
        strokeWidth: 3,
      },
      markerEnd: {
        type: 'arrowclosed',
        color: getEdgeColor(edge.label),
        width: 20,
        height: 20,
      },
      labelStyle: {
        fill: getEdgeColor(edge.label),
        fontWeight: 600,
        fontSize: 12,
      },
      labelBgStyle: {
        fill: '#ffffff',
        fillOpacity: 0.9,
      },
    }));

    console.log('Setting mock nodes:', flowNodes);
    console.log('Setting mock edges:', flowEdges);

    setNodes(flowNodes);
    setEdges(flowEdges);
    setAnalysisComplete(true);
  }, []); // Empty dependency array means this runs once on mount

  // Always show the component - use demo data if no document is uploaded

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiShare2 className="h-6 w-6 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Data Sharing Map</h3>
          </div>
          <button
            onClick={() => {
              console.log('Button clicked - calling analyzeDataSharingPractices');
              analyzeDataSharingPractices();
            }}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-md transition-colors"
          >
            {isAnalyzing ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiShare2 className="h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : analysisComplete ? 'Re-analyze' : originalText ? 'Analyze Data Sharing' : 'Show Demo Data'}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Interactive visualization of how your data flows between the company and third parties.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>How to read this map:</strong> Data flows from left to right (User → Company → Third Parties). Click on arrows to see specific clauses. Hover over nodes for details.
          </p>
        </div>
      </div>

      <div className="h-96 relative">
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-3">
              <FiLoader className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300">Analyzing data sharing practices...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FiInfo className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={analyzeDataSharingPractices}
                className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        )}



        {(analysisComplete && nodes.length > 0) || (!isAnalyzing && nodes.length > 0) ? (
          <div className="relative h-96">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50 dark:bg-gray-900 w-full h-full"
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>

            {/* Data Flow Legend */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-xs">
              <h4 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Data Flow Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">User Data Source</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Company (Primary)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Third Parties</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-100 border-2 border-purple-300 rounded"></div>
                  <span className="text-gray-700 dark:text-gray-300">Government/Legal</span>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Personal Data</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-4 h-0.5 bg-amber-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Analytics Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-0.5 bg-purple-500"></div>
                    <span className="text-gray-700 dark:text-gray-300">Marketing Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !isAnalyzing ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No data sharing visualization available. Click "Show Demo Data" to see an example.</p>
          </div>
        ) : null}

        {analysisComplete && nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FiInfo className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No data sharing practices detected in this document.</p>
            </div>
          </div>
        )}
      </div>

      {/* Edge Details Panel */}
      {selectedEdge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Data Flow Details</h4>
            <button
              onClick={() => setSelectedEdge(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <strong>Data Type:</strong> {selectedEdge.label}
          </p>
          {selectedEdge.data?.clause && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded border">
              <strong>Related Clause:</strong> {selectedEdge.data.clause}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default DataSharingMap;
