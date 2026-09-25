#!/usr/bin/env bun
import { createCli } from "./cli.ts";

createCli().parse(process.argv);
