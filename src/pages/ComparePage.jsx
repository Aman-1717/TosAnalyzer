import { motion } from 'framer-motion';
import { ComprehensiveTOSComparison } from '../components/ComprehensiveTOSComparison';

function ComparePage() {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <ComprehensiveTOSComparison />
    </motion.div>
  );
}

export default ComparePage;
