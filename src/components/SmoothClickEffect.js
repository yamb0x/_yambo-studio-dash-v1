import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';

const MotionWrapper = styled(motion.div)({
  display: 'contents',
});

const SmoothClickEffect = ({ children }) => {
  return (
    <MotionWrapper
      whileTap={{ 
        scale: 0.97,
        opacity: 0.8,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </MotionWrapper>
  );
};

export default SmoothClickEffect;
