"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const tl = require("azure-pipelines-task-lib/task");
tl.setResourcePath(path.join(__dirname, 'task.json'));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let inputMajorVersion = tl.getInput('majorVersion', true);
            let inputMinorVersion = tl.getInput('minorVersion', true);
            let inputPatchVersion = tl.getInput('patchVersion', true);
            let inputWorkingDirectory = tl.getPathInput('workingDirectory', false);
            let inputVersionBump = tl.getInput('versionNumberBumb', true);
            let inputIncrementMinorVersionBranches = tl.getInput('incrementMinorBranchRegex', true);
            let inputIncrementPatchVersionBranches = tl.getInput('incrementPatchBranchRegex', true);
            let baseVersionNumber = `${inputMajorVersion}.${inputMinorVersion}.${inputPatchVersion}`;
            console.log(`Executing git history `);
            let gitPath = tl.which('git', true);
            let gitHistory = tl
                .tool(gitPath)
                .arg('rev-list')
                .arg('--all')
                .arg('--remotes')
                .arg('--oneline');
            let options = {
                cwd: inputWorkingDirectory !== null && inputWorkingDirectory !== void 0 ? inputWorkingDirectory : __dirname,
                failOnStdErr: false,
                errStream: process.stdout,
                outStream: process.stdout,
                ignoreReturnCode: false
            };
            var history = "";
            gitHistory.on('stdout', (commit) => {
                history += commit;
            });
            yield gitHistory.exec(options);
            let commits = history.split('\n');
            var majorVersion = 0 + Number.parseInt(inputMajorVersion);
            var minorVersion = 0 + Number.parseInt(inputMinorVersion);
            var patchVersion = 0 + Number.parseInt(inputPatchVersion);
            var branchesFound = new Array();
            let reverseCommits = commits.reverse();
            if (reverseCommits.length > 0) {
                reverseCommits.forEach((commit, index) => {
                    if (new RegExp(inputIncrementMinorVersionBranches).test(commit)) {
                        let matches = new RegExp(inputIncrementMinorVersionBranches).exec(commit);
                        if (!branchesFound.some(b => matches.some(branchCommit => branchCommit === b))) {
                            branchesFound.push(matches[0]);
                            if (commit.indexOf(inputVersionBump) > 0) {
                                minorVersion = 0;
                                majorVersion += 1;
                            }
                            else {
                                minorVersion += 1;
                            }
                            patchVersion = 0;
                        }
                    }
                    else if (new RegExp(inputIncrementPatchVersionBranches).test(commit)) {
                        let matches = new RegExp(inputIncrementPatchVersionBranches).exec(commit);
                        if (!branchesFound.some(b => matches.some(branchCommit => branchCommit === b))) {
                            branchesFound.push(matches[0]);
                            patchVersion += 1;
                        }
                    }
                });
            }
            let buildVersionNumber = `${majorVersion}.${minorVersion}.${patchVersion}`;
            tl.setVariable('versionNumberBuild', buildVersionNumber);
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
