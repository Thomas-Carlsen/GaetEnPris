
export interface IStateContext {

    isSetupPhase: boolean;
    setIsSetupPhase: (value: boolean) => void;
    
    numberOfRounds: number;
    setNumberOfRounds: (value: number) => void;

    numberOfTeams: number;
    setNumberOfTeams: (value: number) => void;
}
