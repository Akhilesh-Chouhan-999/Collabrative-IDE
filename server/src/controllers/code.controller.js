import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export const executeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required',
      });
    }

    let command = '';
    let filename = '';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);

    switch (language.toLowerCase()) {
      case 'javascript':
        filename = `code_${timestamp}_${randomId}.js`;
        command = `node ${filename}`;
        break;
      case 'python':
        filename = `code_${timestamp}_${randomId}.py`;
        command = `python ${filename}`;
        break;
      case 'java':
        filename = `Code_${timestamp}_${randomId}.java`;
        const className = `Code_${timestamp}_${randomId}`;
        // Java requires class name to match filename
        const javaCode = code.includes('class ') 
          ? code 
          : `public class ${className} {\n    public static void main(String[] args) {\n        ${code}\n    }\n}`;
        fs.writeFileSync(path.join(tempDir, filename), javaCode);
        const compileCommand = `javac ${filename}`;
        const runCommand = `java ${className}`;
        try {
          await execAsync(compileCommand, { cwd: tempDir, timeout: 10000 });
          const { stdout, stderr } = await execAsync(runCommand, { cwd: tempDir, timeout: 10000 });
          // Cleanup
          fs.unlinkSync(path.join(tempDir, filename));
          fs.unlinkSync(path.join(tempDir, `${className}.class`));
          return res.status(200).json({
            success: true,
            output: stdout || stderr || 'Code executed successfully',
          });
        } catch (error) {
          // Cleanup on error
          if (fs.existsSync(path.join(tempDir, filename))) {
            fs.unlinkSync(path.join(tempDir, filename));
          }
          return res.status(200).json({
            success: false,
            error: error.stderr || error.message || 'Execution failed',
          });
        }
      case 'cpp':
        filename = `code_${timestamp}_${randomId}.cpp`;
        const cppOutput = `code_${timestamp}_${randomId}`;
        fs.writeFileSync(path.join(tempDir, filename), code);
        try {
          await execAsync(`g++ ${filename} -o ${cppOutput}`, { cwd: tempDir, timeout: 10000 });
          const { stdout, stderr } = await execAsync(`./${cppOutput}`, { cwd: tempDir, timeout: 10000 });
          // Cleanup
          fs.unlinkSync(path.join(tempDir, filename));
          fs.unlinkSync(path.join(tempDir, cppOutput));
          return res.status(200).json({
            success: true,
            output: stdout || stderr || 'Code executed successfully',
          });
        } catch (error) {
          // Cleanup on error
          if (fs.existsSync(path.join(tempDir, filename))) {
            fs.unlinkSync(path.join(tempDir, filename));
          }
          return res.status(200).json({
            success: false,
            error: error.stderr || error.message || 'Compilation/Execution failed',
          });
        }
      case 'c':
        filename = `code_${timestamp}_${randomId}.c`;
        const cOutput = `code_${timestamp}_${randomId}`;
        fs.writeFileSync(path.join(tempDir, filename), code);
        try {
          await execAsync(`gcc ${filename} -o ${cOutput}`, { cwd: tempDir, timeout: 10000 });
          const { stdout, stderr } = await execAsync(`./${cOutput}`, { cwd: tempDir, timeout: 10000 });
          // Cleanup
          fs.unlinkSync(path.join(tempDir, filename));
          fs.unlinkSync(path.join(tempDir, cOutput));
          return res.status(200).json({
            success: true,
            output: stdout || stderr || 'Code executed successfully',
          });
        } catch (error) {
          // Cleanup on error
          if (fs.existsSync(path.join(tempDir, filename))) {
            fs.unlinkSync(path.join(tempDir, filename));
          }
          return res.status(200).json({
            success: false,
            error: error.stderr || error.message || 'Compilation/Execution failed',
          });
        }
      default:
        return res.status(400).json({
          success: false,
          message: `Language ${language} is not supported for execution`,
        });
    }

    // For JavaScript and Python
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, code);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: tempDir,
        timeout: 10000, // 10 second timeout
      });

      // Cleanup
      fs.unlinkSync(filePath);

      return res.status(200).json({
        success: true,
        output: stdout || stderr || 'Code executed successfully',
      });
    } catch (error) {
      // Cleanup on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({
        success: false,
        error: error.stderr || error.message || 'Execution failed',
      });
    }
  } catch (error) {
    console.error('Error executing code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during code execution',
      error: error.message,
    });
  }
};

export const getAIRecommendations = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required',
      });
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Return basic recommendations without AI
      return res.status(200).json({
        success: true,
        recommendations: [
          {
            type: 'info',
            title: 'AI Recommendations',
            message: 'AI recommendations are not configured. Please set OPENAI_API_KEY in your .env file to enable AI features.',
          },
          {
            type: 'tip',
            title: 'Code Quality Tip',
            message: 'Consider adding comments to explain complex logic and using meaningful variable names.',
          },
        ],
      });
    }

    // Call OpenAI API
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a helpful coding assistant. Provide concise, actionable recommendations for ${language} code. Focus on:
1. Code quality improvements
2. Best practices
3. Potential bugs or issues
4. Performance optimizations
5. Code style suggestions

Format your response as JSON with an array of recommendations, each with: type (info/tip/warning/error), title, and message.`,
            },
            {
              role: 'user',
              content: `Review this ${language} code and provide recommendations:\n\n\`\`\`${language}\n${code}\n\`\`\``,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      
      // Try to parse JSON response
      let recommendations = [];
      try {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create a single recommendation from the text
          recommendations = [
            {
              type: 'info',
              title: 'AI Recommendation',
              message: aiResponse,
            },
          ];
        }
      } catch (parseError) {
        recommendations = [
          {
            type: 'info',
            title: 'AI Recommendation',
            message: aiResponse,
          },
        ];
      }

      return res.status(200).json({
        success: true,
        recommendations,
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError.response?.data || openaiError.message);
      
      return res.status(200).json({
        success: true,
        recommendations: [
          {
            type: 'error',
            title: 'AI Service Error',
            message: 'Failed to get AI recommendations. Please check your API key configuration.',
          },
        ],
      });
    }
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during AI recommendation',
      error: error.message,
    });
  }
};

