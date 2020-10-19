import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import tr = require('azure-pipelines-task-lib/toolrunner');

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        // Initialization variables
        let inputMajorVersion = tl.getInput('majorVersion', true);
        let inputMinorVersion = tl.getInput('minorVersion', true);
        let inputPatchVersion = tl.getInput('patchVersion', true);
        let inputWorkingDirectory = tl.getPathInput('workingDirectory', false);
        let inputVersionBump = tl.getInput('versionNumberBumb', true);
        let inputIncrementMinorVersionBranches = tl.getInput('incrementMinorBranchRegex', true);
        let inputIncrementPatchVersionBranches = tl.getInput('incrementPatchBranchRegex', true);

        console.log(`Executing git history `);
        // Get git path
        let gitPath = tl.which('git', true);

        // Get all history from git repository
        let gitHistory = tl
            .tool(gitPath)
            .arg('rev-list')
            .arg('--all')
            .arg('--remotes')
            .arg('--oneline');

        let options = <tr.IExecOptions> {
            cwd: inputWorkingDirectory ?? __dirname, 
            failOnStdErr: false,
            errStream: process.stdout, // Direct all output to STDOUT, otherwise the output may appear out
            outStream: process.stdout, // of order since Node buffers it's own STDOUT but not STDERR.
            ignoreReturnCode: false
        };

        var history = "";

        // Get commits from output from execution command
        gitHistory.on('stdout', (commit) => {
            history += commit;
        });

        // Execute the git command
        await gitHistory.exec(options);

        
        let commits = history.split('\n');

        // Build version number variables
        var majorVersion = 0 + Number.parseInt(inputMajorVersion);
        var minorVersion = 0 + Number.parseInt(inputMinorVersion);
        var patchVersion = 0 + Number.parseInt(inputPatchVersion);
        var branchesFound = new Array<string>();
        
        // Ordering the history commit from initial commit until the current days
        let reverseCommits = commits.reverse();
        
        if (reverseCommits.length > 0) {
            reverseCommits.forEach((commit, index) => { //Each commit will check if increments or not
                if (new RegExp(inputIncrementMinorVersionBranches).test(commit)) {
                    let matches = new RegExp(inputIncrementMinorVersionBranches).exec(commit);
                    if (!branchesFound.some(b => matches.some(branchCommit => branchCommit === b))) {
                        branchesFound.push(matches[0]);
                        if (commit.indexOf(inputVersionBump) > 0) {
                            minorVersion = 0;
                            majorVersion += 1;
                        } else {
                            minorVersion += 1;
                        }
                        patchVersion = 0;
                    }
                } else if (new RegExp(inputIncrementPatchVersionBranches).test(commit)) {
                    let matches = new RegExp(inputIncrementPatchVersionBranches).exec(commit);

                    if (!branchesFound.some(b => matches.some(branchCommit => branchCommit === b))) {
                        branchesFound.push(matches[0]);
                        patchVersion += 1
                    }
                }
            });
        }

        // Build a single version number with format vMAJOR.MINOR.PATCH (SematicVersion)
        let buildVersionNumber = `${majorVersion}.${minorVersion}.${patchVersion}`;

        tl.setVariable('versionNumberBuild', buildVersionNumber);
    }
    catch(err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

// Executes the task
run();