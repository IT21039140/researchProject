import { motion } from "framer-motion";
import PropTypes from "prop-types"; // Optional if you want to use PropTypes

const RankingAnimation = ({ item }) => {
  // Ensure item is provided and has the necessary properties
  if (!item || !item.rank || !item.name || !item.score) {
    return <p>Invalid item data</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <p>
        {item.rank}. {item.name} - {item.score}
      </p>
    </motion.div>
  );
};

// Optional: Add PropTypes for validation
RankingAnimation.propTypes = {
  item: PropTypes.shape({
    rank: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
  }).isRequired,
};

export default RankingAnimation;
