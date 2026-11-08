import { describe, expect, it } from 'vitest';
import { createProfile } from './data';
import { migrateProfileNames } from './storage';
import { emptyTraining } from '../features/training/model';
describe('demo profile identity migration', () => {
  it('renames both profiles while retaining IDs, session and all existing data', () => {
    const victor = createProfile('victor', 'Victor', 'victor@base.demo');
    const julia = {...createProfile('julia', 'Júlia', 'julia@base.demo'), training: {...emptyTraining(), weights: [{date:'2026-11-06',kg:65}]}};
    const result = migrateProfileNames({version:1,profiles:[victor,julia],session:'julia'});
    expect(result.session).toBe('julia');
    expect(result.profiles.map(p => p.name)).toEqual(['Victor Hugo Araujo','Lívia Sardenberg']);
    expect(result.profiles[1]).toEqual({...julia,name:'Lívia Sardenberg',email:'livia@base.demo'});
    expect(result.profiles[0].meals).toBe(victor.meals);
  });
  it('runs only once and leaves unrelated accounts untouched', () => {
    const account=createProfile('account-uuid','Personal name','person@example.com');
    const first=migrateProfileNames({version:1,profiles:[createProfile('victor','Victor','victor@base.demo'),account],session:null});
    first.profiles[0].name='Victor H. Araujo';
    expect(migrateProfileNames(first)).toBe(first);
    expect(first.profiles[1]).toBe(account);
  });
});
