"""
Logger Configuration - Creates unique log files for each prediction request
"""
import logging
import os
from datetime import datetime
import uuid


class RequestLogger:
    """Create and manage unique log files for each request"""
    
    def __init__(self, logs_dir="logs"):
        """
        Initialize logger configuration
        Args:
            logs_dir: Directory to store log files
        """
        self.logs_dir = logs_dir
        
        # Create logs directory if it doesn't exist
        os.makedirs(self.logs_dir, exist_ok=True)
    
    def create_logger(self, task_type, model_id=None):
        """
        Create a unique logger for a request
        Args:
            task_type: Type of task (classification, detection, count)
            model_id: Model identifier (for classification)
        Returns:
            tuple: (logger, log_filename)
        """
        # Generate unique log filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        if model_id:
            log_filename = f"{timestamp}_{task_type}_{model_id}_{unique_id}.log"
        else:
            log_filename = f"{timestamp}_{task_type}_{unique_id}.log"
        
        log_filepath = os.path.join(self.logs_dir, log_filename)
        
        # Create logger with unique name
        logger_name = f"{task_type}_{unique_id}"
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.DEBUG)
        
        # Remove any existing handlers
        logger.handlers.clear()
        
        # Create file handler
        file_handler = logging.FileHandler(log_filepath, mode='w', encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        
        # Create console handler (optional - for critical errors)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.ERROR)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        # Add handlers to logger
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        # Log initial information
        logger.info("="*60)
        logger.info(f"New {task_type.upper()} Request")
        if model_id:
            logger.info(f"Model: {model_id}")
        logger.info(f"Log File: {log_filename}")
        logger.info("="*60)
        
        return logger, log_filename
    
    def cleanup_old_logs(self, days=7):
        """
        Clean up log files older than specified days
        Args:
            days: Number of days to keep logs
        """
        import time
        
        now = time.time()
        cutoff = now - (days * 86400)  # days * seconds per day
        
        deleted_count = 0
        for filename in os.listdir(self.logs_dir):
            if filename.endswith('.log'):
                filepath = os.path.join(self.logs_dir, filename)
                if os.path.getmtime(filepath) < cutoff:
                    os.remove(filepath)
                    deleted_count += 1
        
        return deleted_count


# Global logger manager
logger_manager = RequestLogger()
