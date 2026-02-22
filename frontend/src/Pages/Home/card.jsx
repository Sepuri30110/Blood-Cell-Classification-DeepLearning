import React from "react";

function Card() {
    return (
        <div className="project-card">
            <h2>Know about me</h2>
            <div className="card-content">
                <div className="card-scroll-wrapper">
                    <div className="scroll-item">
                        <h3>🔬 Overview</h3>
                        <p>
                            HemoVision leverages advanced deep learning algorithms to analyze
                            microscopic blood cell images, providing accurate multi-class classification
                            across various cell types including RBCs, WBCs, and Platelets.
                        </p>

                        <h3>🎯 Key Features</h3>
                        <ul>
                            <li>Real-time blood cell classification</li>
                            <li>High-accuracy image recognition</li>
                            <li>Detailed morphological analysis</li>
                            <li>Automated report generation</li>
                            <li>User-friendly interface for clinicians</li>
                        </ul>

                        <h3>🧬 Cell Types Detected</h3>
                        <ul>
                            <li><strong>Red Blood Cells (RBCs):</strong></li>
                            <li><strong>White Blood Cells (WBCs):</strong> Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils</li>
                            <li><strong>Platelets:</strong></li>
                        </ul>

                        <h3>📊 Clinical Applications</h3>
                        <p>
                            This system assists in diagnosing various hematological conditions
                            including anemia, infections, leukemia, and other blood disorders
                            by providing rapid and consistent cell type identification.
                        </p>

                        <h3>🔍 Technology Stack</h3>
                        <ul>
                            <li>Convolutional Neural Networks (CNN)</li>
                            <li>TensorFlow/PyTorch frameworks</li>
                            <li>Image preprocessing and augmentation</li>
                            <li>Transfer learning techniques</li>
                        </ul>

                        <h3>✨ Benefits</h3>
                        <p>
                            Reduces manual counting errors, saves time in laboratory workflows,
                            provides reproducible results, and enables early detection of
                            abnormalities in blood samples.
                        </p>
                    </div>
                    <div className="scroll-item">
                        <h3>🔬 Overview</h3>
                        <p>
                            HemoVision leverages advanced deep learning algorithms to analyze
                            microscopic blood cell images, providing accurate multi-class classification
                            across various cell types including RBCs, WBCs, and Platelets.
                        </p>

                        <h3>🎯 Key Features</h3>
                        <ul>
                            <li>Real-time blood cell classification</li>
                            <li>High-accuracy image recognition</li>
                            <li>Detailed morphological analysis</li>
                            <li>Automated report generation</li>
                            <li>User-friendly interface for clinicians</li>
                        </ul>

                        <h3>🧬 Cell Types Detected</h3>
                        <ul>
                            <li><strong>Red Blood Cells (RBCs)</strong></li>
                            <li><strong>White Blood Cells (WBCs):</strong> Neutrophils, Lymphocytes, Monocytes, Eosinophils, Basophils</li>
                            <li><strong>Platelets</strong></li>
                        </ul>

                        <h3>🔍 Technology Stack</h3>
                        <ul>
                            <li>Convolutional Neural Networks (CNN)</li>
                            <li>TensorFlow/PyTorch frameworks</li>
                            <li>Image preprocessing and augmentation</li>
                            <li>Transfer learning techniques</li>
                        </ul>

                        <h3>✨ Benefits</h3>
                        <p>
                            Reduces manual counting errors, saves time in laboratory workflows,
                            provides reproducible results, and enables early detection of
                            abnormalities in blood samples.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;
