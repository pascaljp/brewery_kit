import {run, installInkbird, updateInkbird} from './update_job_internal';

describe('UpdateJob', () => {
  test('run', () => {
    const output = run('cd /; ls');
    expect(output).toContain('tmp');
    expect(output).toContain('home');
    expect(output).toContain('bin');
  });

  test('Install', () => {
    const rootDir = '/tmp/brewery_toolkit/test';
    const gitDir = `${rootDir}/brewery_kit`;

    run(`rm -rf ${rootDir}`);
    run(`mkdir -p ${rootDir}`);
    expect(run(`ls ${rootDir}`)).not.toContain('brewery_kit');

    // Install master branch.
    installInkbird('master', rootDir);
    expect(() => run(`test -d ${gitDir}`)).not.toThrowError();
    expect(run('git rev-parse --abbrev-ref HEAD', gitDir)).toContain('master');

    // Switch to v1.0 branch.
    updateInkbird('v1.0', rootDir);
    expect(run('git rev-parse --abbrev-ref HEAD', gitDir)).toContain('v1.0');
  });
});
