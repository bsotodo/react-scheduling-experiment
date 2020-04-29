import { promises as fs } from 'fs';
import * as http from 'http';
import { Server } from 'http';
import * as path from 'path';

import chalk from 'chalk';
import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import yargs from 'yargs';

// Define logging symbols
const arrowSymbol: string = process.platform === 'win32' ? '→' : '➜';

// Run
(async () => {
  // Extract CLI parameters
  const cliParameters = yargs
    .option('numberOfExecutions', {
      type: 'number',
      required: true,
    })
    .option('numberOfGeneratedEvents', {
      type: 'number',
      required: true,
    })
    .strict(true).argv;

  // Logging
  console.log(chalk.white.bold.underline('React Scheduling Performance Analysis'));
  console.log('');
  const startTime = new Date().getTime();

  // Start server
  console.log(`${arrowSymbol} Start server`);
  const server: Server = http.createServer(async (request, response) => {
    const data: Buffer = await fs.readFile(path.join(__dirname, (request.url || '').split('?')[0]));
    response.writeHead(200);
    response.end(data);
  });
  await new Promise((resolve: () => void): void => {
    server.listen(3000, (): void => {
      resolve();
    });
  });

  // Start browser
  console.log(`${arrowSymbol} Start browser`);
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  const baseUrl: string = 'http://localhost:3000/index.html';
  const queryParameters: URLSearchParams = new URLSearchParams();
  queryParameters.set('numberOfExecutions', cliParameters.numberOfExecutions.toString());
  queryParameters.set('numberOfGeneratedEvents', cliParameters.numberOfGeneratedEvents.toString());
  await page.goto(`${baseUrl}?${queryParameters.toString()}`);

  // Wait for and retrieve results
  console.log(`${arrowSymbol} Run performance analysis`);
  const results: string = await new Promise((resolve: (value: string) => void): void => {
    page.on('console', async (event) => {
      const value: string = (await event.args()[0].jsonValue()) as string;
      resolve(value);
    });
  });

  // Write results to file
  console.log(`${arrowSymbol} Save performance analysis results to disk`);
  await fs.writeFile('./results.json', results);

  // Close browser
  console.log(`${arrowSymbol} Close browser`);
  await browser.close();

  // Close server
  console.log(`${arrowSymbol} Close server`);
  await new Promise((resolve) => {
    server.close(() => {
      resolve();
    });
  });

  // Logging
  const endTime = new Date().getTime();
  const processTime = ((endTime - startTime) / 1000).toFixed(2);
  console.log('');
  console.log(chalk.green.bold(`Done! [${processTime} seconds]`));
})();
