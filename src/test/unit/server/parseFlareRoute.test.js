import { expect } from 'chai';
import express from 'express';
import axios from 'axios';
import { parseFlareCommand, validateParsedCommand } from '../../../../packages/core/dist/index.js';

const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;

/**
 * Inline recreation of the /parse-flare route logic for unit testing.
 * This avoids pulling in the full server dependency tree.
 */
function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/parse-flare', (req, res) => {
    try {
      const { command } = req.body;

      if (!command || typeof command !== 'string' || command.trim() === '') {
        return res.status(HTTP_BAD_REQUEST).json({
          error: 'Missing or invalid FLARE command. Please provide a valid command string.',
          success: false
        });
      }

      const parsed = parseFlareCommand(command.trim());
      validateParsedCommand(parsed);

      res.status(HTTP_OK).json({
        success: true,
        parsed,
        command: command.trim()
      });
    } catch (error) {
      res.status(HTTP_BAD_REQUEST).json({
        error: error.message || 'Failed to parse FLARE command.',
        success: false
      });
    }
  });

  return app;
}

describe('POST /parse-flare route', () => {
  let server;
  let baseUrl;

  before((done) => {
    server = buildApp().listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      done();
    });
  });

  after((done) => {
    server.close(done);
  });

  it('should return success:true with parsed object for a valid command', async () => {
    const res = await axios.post(`${baseUrl}/parse-flare`, {
      command: '{ flare model:openai `Hello world` }'
    });

    expect(res.status).to.equal(HTTP_OK);
    expect(res.data.success).to.be.true;
    expect(res.data.parsed).to.be.an('object');
    expect(res.data.parsed.model).to.deep.equal(['openai']);
    expect(res.data.parsed.postProcessing).to.be.an('array');
    expect(res.data.command).to.equal('{ flare model:openai `Hello world` }');
  });

  it('should return success:true with multiple models parsed correctly', async () => {
    const res = await axios.post(`${baseUrl}/parse-flare`, {
      command: '{ flare model:openai,mistral temp:0.7 vote `Compare these` }'
    });

    expect(res.status).to.equal(HTTP_OK);
    expect(res.data.success).to.be.true;
    expect(res.data.parsed.model).to.deep.equal(['openai', 'mistral']);
    expect(res.data.parsed.temp).to.equal(0.7);
    expect(res.data.parsed.postProcessing).to.include('vote');
  });

  it('should return 400 when body has no command property', async () => {
    try {
      await axios.post(`${baseUrl}/parse-flare`, {});
      throw new Error('Expected request to fail with 400');
    } catch (err) {
      expect(err.response.status).to.equal(HTTP_BAD_REQUEST);
      expect(err.response.data.success).to.be.false;
      expect(err.response.data.error).to.be.a('string').with.length.greaterThan(0);
    }
  });

  it('should return 400 when command is an empty string', async () => {
    try {
      await axios.post(`${baseUrl}/parse-flare`, { command: '' });
      throw new Error('Expected request to fail with 400');
    } catch (err) {
      expect(err.response.status).to.equal(HTTP_BAD_REQUEST);
      expect(err.response.data.success).to.be.false;
    }
  });

  it('should return 400 when command is whitespace only', async () => {
    try {
      await axios.post(`${baseUrl}/parse-flare`, { command: '   ' });
      throw new Error('Expected request to fail with 400');
    } catch (err) {
      expect(err.response.status).to.equal(HTTP_BAD_REQUEST);
      expect(err.response.data.success).to.be.false;
    }
  });

  it('should return 400 with error message for invalid FLARE syntax', async () => {
    try {
      await axios.post(`${baseUrl}/parse-flare`, {
        command: 'this is not valid flare syntax'
      });
      throw new Error('Expected request to fail with 400');
    } catch (err) {
      expect(err.response.status).to.equal(HTTP_BAD_REQUEST);
      expect(err.response.data.success).to.be.false;
      expect(err.response.data.error).to.be.a('string').with.length.greaterThan(0);
    }
  });
});
