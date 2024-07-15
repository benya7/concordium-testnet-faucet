interface IProps {
  inputValue: string;
  handleInputValue: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitButton: () => void;
  inputPlaceHolder: string;
  submitButtonText: string;
  inputDisabled?: boolean;
  submitButtonDisabled?: boolean;
}

export const SingleInputForm = ({
  inputValue,
  handleInputValue,
  handleSubmitButton,
  inputPlaceHolder,
  submitButtonText,
  inputDisabled,
  submitButtonDisabled
}: IProps) => (
  <div className="flex flex-col w-full max-w-xl gap-4 sm:flex-row sm:justify-center mt-1">
    <input
      type="text"
      placeholder={inputPlaceHolder}
      value={inputValue}
      className="h-10 sm:h-12 w-full text-xs sm:text-sm px-2 border border-[--dark-blue] disabled:text-gray-400 focus-visible:outline-none"
      disabled={inputDisabled}
      onChange={handleInputValue}
    />
    <button
      className="bg-[--blue] px-2 py-1 min-h-10 font-semibold text-white hover:bg-[--blue-light] disabled:bg-gray-300 disabled:cursor-default w-28 self-center sm:self-auto sm:w-40 text-nowrap"
      onClick={handleSubmitButton}
      disabled={submitButtonDisabled}
    >
      {submitButtonText}
    </button>
  </div>
)