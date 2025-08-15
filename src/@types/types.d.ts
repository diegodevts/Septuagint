export type Morphology = {
    word: string;
    lemma: string;
    pos: Langs;
    double_lemma: string;
};

type Langs = {
    PT: string;
    EN: string;
};

export type RootStackParamList = {
    Menu: any | undefined;
    Bible: any | undefined;
    Lexicon: any | undefined;
};
